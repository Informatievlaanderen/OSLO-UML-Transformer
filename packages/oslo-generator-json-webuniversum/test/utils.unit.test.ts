/**
 * @group unit
 */

import { sortWebuniversumObjects } from "../lib/utils/utils";

describe('Utils functions', () => {
	it('should sort WebuniversumObjects based on their vocabulary label', () => {
		const webuniversumObjects = [
			{
				id: 'http://example.com/A',
				vocabularyLabel: {
					en: 'A',
				},
			},
			{
				id: 'http://example.com/B',
				vocabularyLabel: {
					en: 'B',
				},
			},
			{
				id: 'http://example.com/C',
				vocabularyLabel: {
					en: 'C',
				},
			},
			{
				id: 'http://example.com/D',
			},
		];

		const sortedWebuniversumObjects = sortWebuniversumObjects(webuniversumObjects, 'en').map((obj) => obj.id);
		expect(sortedWebuniversumObjects).toEqual([
			'http://example.com/D',
			'http://example.com/A',
			'http://example.com/B',
			'http://example.com/C',
		])
	});
})