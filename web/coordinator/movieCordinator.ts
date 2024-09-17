import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import bs58 from 'bs58';
import { Movie } from '@/models/movie-model';

// Use the correct account type as returned by getProgramAccounts()
type ProgramAccount = {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
};

export const MOVIE_REVIEW_PROGRAM_ID =
  'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN';

const DATA_OFFSET = 2; // Skip the first 2 bytes, which store versioning information for the data schema of the account. This versioning ensures that changes to the account's structure can be tracked and managed over time.
const DATA_LENGTH = 18; // Retrieve 18 bytes of data, including the part of the account's data that stores the user's public key for comparison.

export class MovieCoordinator {
  static accounts: Array<PublicKey> = [];

  static async prefetchAccounts(connection: Connection, search: string) {
    try {
      // Get readonly accounts response
      const readonlyAccounts = await connection.getProgramAccounts(
        new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
        {
          dataSlice: { offset: DATA_OFFSET, length: DATA_LENGTH },
          filters:
            search === ''
              ? []
              : [
                  {
                    memcmp: {
                      offset: 6,
                      bytes: bs58.encode(Buffer.from(search)), // Convert the search string to Base58 for comparison with the on-chain data.
                    },
                  },
                ],
        }
      );

      // Make a mutable copy of the readonly array
      const accounts: Array<ProgramAccount> = Array.from(readonlyAccounts);

      // Define a constant for the size of the header in each account buffer
      const HEADER_SIZE = 4; // 4 bytes for length header

      accounts.sort((a, b) => {
        try {
          if (!a.account.data || !b.account.data) {
            throw new Error('Account data is undefined');
          }

          // Check if buffers are long enough to avoid out-of-bounds access
          const lengthA = a.account.data.readUInt32LE(0);
          const lengthB = b.account.data.readUInt32LE(0);

          if (
            a.account.data.length < HEADER_SIZE + lengthA ||
            b.account.data.length < HEADER_SIZE + lengthB
          ) {
            throw new Error('Buffer length is insufficient');
          }

          const dataA = a.account.data.subarray(
            HEADER_SIZE,
            HEADER_SIZE + lengthA
          );
          const dataB = b.account.data.subarray(
            HEADER_SIZE,
            HEADER_SIZE + lengthB
          );

          return Buffer.compare(dataA, dataB);
        } catch (error) {
          console.error('Error sorting accounts: ', error);
          return 0;
        }
      });

      this.accounts = accounts.map((account) => account.pubkey);
    } catch (error) {
      console.error('Error prefetching accounts:', error);
    }
  }

  static async fetchPage(
    connection: Connection,
    page: number,
    perPage: number,
    search: string,
    reload = false
  ): Promise<Array<Movie>> {
    if (this.accounts.length === 0 || reload) {
      await this.prefetchAccounts(connection, search);
    }

    const paginatedPublicKeys = this.accounts.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (paginatedPublicKeys.length === 0) {
      return [];
    }

    const accounts = await connection.getMultipleAccountsInfo(
      paginatedPublicKeys
    );

    const movies = accounts.reduce((accumulator: Array<Movie>, account) => {
      try {
        if (account?.data) {
          const movie = Movie.deserialize(account.data);
          if (movie) {
            accumulator.push(movie);
          }
        }
      } catch (error) {
        console.error('Error deserializing movie data: ', error);
      }
      return accumulator;
    }, []);

    return movies;
  }
}
