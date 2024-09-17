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

const DATA_OFFSET = 2;
const DATA_LENGTH = 18;

export class MovieCoordinator {
  static accounts: PublicKey[] = [];

  static async prefetchAccounts(connection: Connection, search: string) {
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
                    bytes: bs58.encode(Buffer.from(search)),
                  },
                },
              ],
      }
    );

    // Make a mutable copy of the readonly array
    const accounts: ProgramAccount[] = Array.from(readonlyAccounts);

    accounts.sort((a, b) => {
      try {
        if (!a.account.data || !b.account.data) {
          throw new Error('Account data is undefined');
        }

        const lengthA = a.account.data.readUInt32LE(0);
        const lengthB = b.account.data.readUInt32LE(0);

        if (
          a.account.data.length < 4 + lengthA ||
          b.account.data.length < 4 + lengthB
        ) {
          return 0; // Skip sorting if data length is insufficient
        }

        const dataA = a.account.data.subarray(4, 4 + lengthA);
        const dataB = b.account.data.subarray(4, 4 + lengthB);

        return Buffer.compare(dataA, dataB);
      } catch (error) {
        console.error('Error sorting accounts: ', error);
        return 0; // Default sort order in case of error
      }
    });

    this.accounts = accounts.map((account) => account.pubkey);
  }

  static async fetchPage(
    connection: Connection,
    page: number,
    perPage: number,
    search: string,
    reload = false
  ): Promise<Movie[]> {
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

    const movies = accounts.reduce((accumulator: Movie[], account) => {
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
