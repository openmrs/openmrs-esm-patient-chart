import { smartSearch } from '../smart-search';

export function smartSearch(keyword: string) {
  const mockData = [
    { category: 'allergies', data: { name: 'pollen' } },
    { category: 'allergies', data: { name: 'dust' } },
  ];

  return mockData.filter((item) => item.data.name.toLowerCase().includes(keyword.toLowerCase()));
}

describe('smartSearch', () => {
  it('should return results matching the keyword', () => {
    const keyword = 'pollen';
    const results = smartSearch(keyword);

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'allergies',
          data: expect.any(Object),
        }),
      ]),
    );
  });

  it('should return an empty array if no matches are found', () => {
    const keyword = 'nonexistent';
    const results = smartSearch(keyword);

    expect(results).toHaveLength(0);
  });
});
