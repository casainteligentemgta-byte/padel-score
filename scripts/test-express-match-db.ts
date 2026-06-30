import assert from 'node:assert/strict';
import {
  expressCanchaCodesForCourt,
  expressCanonicalCanchaCode,
  expressLegacyCanchaCode,
  updateExpressMatchByCourt,
} from '../src/lib/expressMatchDb';

function run(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`OK  ${name}`))
    .catch((e) => {
      console.error(`ERR ${name}`);
      throw e;
    });
}

function mockSupabase(handlers: {
  find?: (code: string) => Record<string, unknown> | null;
  update?: (id: string, payload: Record<string, unknown>) => { data?: Record<string, unknown>; error?: { message: string } };
  insert?: (payload: Record<string, unknown>) => { data?: Record<string, unknown>; error?: { message: string } };
}) {
  return {
    from(table: string) {
      assert.equal(table, 'express_matches');
      return {
        select() {
          return this;
        },
        eq(_col: string, code: string) {
          return {
            maybeSingle: async () => ({
              data: handlers.find?.(code) ?? null,
              error: null,
            }),
          };
        },
        update(payload: Record<string, unknown>) {
          return {
            eq(_col: string, id: string) {
              return {
                select() {
                  return {
                    maybeSingle: async () => handlers.update?.(id, payload) ?? { data: {}, error: null },
                  };
                },
              };
            },
          };
        },
        insert(rows: Record<string, unknown>[]) {
          return {
            select() {
              return {
                single: async () => handlers.insert?.(rows[0] ?? {}) ?? { data: {}, error: null },
              };
            },
          };
        },
      };
    },
  };
}

async function main() {
  await run('slug helpers', () => {
    assert.deepEqual(expressCanchaCodesForCourt('3'), ['scan-go-3', 'fast-3']);
    assert.equal(expressCanonicalCanchaCode('3'), 'scan-go-3');
    assert.equal(expressLegacyCanchaCode('3'), 'fast-3');
  });

  await run('update keeps legacy cancha_code', async () => {
    const updates: Record<string, unknown>[] = [];
    const supabase = mockSupabase({
      find: (code) => (code === 'fast-3' ? { id: 'row-1', cancha_code: 'fast-3', session_id: 's1' } : null),
      update: (id, payload) => {
        updates.push(payload);
        return {
          data: {
            id,
            cancha_code: 'fast-3',
            session_id: payload.session_id ?? 's1',
            team_a_name: '',
            team_b_name: '',
            team_a_points: '0',
            team_b_points: '0',
            team_a_games: 0,
            team_b_games: 0,
            sets_a: [0, 0, 0],
            sets_b: [0, 0, 0],
            current_set: 1,
            modo_puntos: 'normal',
            punto_de_oro: true,
            is_active: false,
            base_venue: 'Elite',
            display_name_scale: 1,
            display_media_scale: 1,
            display_ticker_phrases: [],
            third_set_mode: 'full',
            server_team: 1,
            server_player: 1,
            chrono_elapsed_sec: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
    });

    const result = await updateExpressMatchByCourt(supabase as never, '3', {
      session_id: 'new-session',
      is_active: false,
    });

    assert.equal(result.ok, true);
    assert.equal(updates.length, 1);
    assert.equal(updates[0].cancha_code, undefined);
  });

  await run('insert retries legacy fast-N on check constraint', async () => {
    const inserted: Record<string, unknown>[] = [];
    let insertAttempt = 0;
    const supabase = mockSupabase({
      find: () => null,
      insert: (payload) => {
        inserted.push(payload);
        insertAttempt += 1;
        if (insertAttempt <= 3) {
          return {
            error: {
              message:
                'new row for relation "express_matches" violates check constraint "express_matches_cancha_code_format_chk"',
            },
          };
        }
        return {
          data: {
            id: 'row-new',
            ...payload,
            team_a_name: '',
            team_b_name: '',
            team_a_points: '0',
            team_b_points: '0',
            team_a_games: 0,
            team_b_games: 0,
            sets_a: [0, 0, 0],
            sets_b: [0, 0, 0],
            current_set: 1,
            modo_puntos: 'normal',
            punto_de_oro: true,
            display_name_scale: 1,
            display_media_scale: 1,
            display_ticker_phrases: [],
            third_set_mode: 'full',
            server_team: 1,
            server_player: 1,
            chrono_elapsed_sec: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
    });

    const result = await updateExpressMatchByCourt(supabase as never, '2', {
      session_id: 'sess-2',
      is_active: false,
      base_venue: 'Elite',
    });

    assert.equal(result.ok, true);
    assert.equal(inserted[0].cancha_code, 'scan-go-2');
    assert.equal(inserted[inserted.length - 1].cancha_code, 'fast-2');
  });
}

main().catch(() => process.exit(1));
