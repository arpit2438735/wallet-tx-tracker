const axios = require('axios');
const { fetchPaginatedTxs } = require('./fetchPaginatedTxs');

jest.mock('axios');

describe('fetchPaginatedTxs', () => {
  it('should fetch paginated data and stop at the last page', async () => {
    // Mock page 1 (10,000 items)
    axios.get
      .mockResolvedValueOnce({
        data: {
          result: Array.from({ length: 10000 }, (_, i) => ({ id: i })),
        },
      })
      // Mock page 2 (only 3 items)
      .mockResolvedValueOnce({
        data: {
          result: [{ id: 10000 }, { id: 10001 }, { id: 10002 }],
        },
      });

    const result = await fetchPaginatedTxs(
      (page, offset) => `https://fake.api?page=${page}&offset=${offset}`,
      0
    );

    expect(result.length).toBe(10003);
    expect(result[0].id).toBe(0);
    expect(result[10002].id).toBe(10002);
  });
});
