import { getMediaUrl } from '../src/utils/mediaUrl.js';

console.log('Testing getMediaUrl utility...');

const tests = [
  { input: '/uploads/example.jpg', expectedContains: '/uploads/example.jpg' },
  { input: '/uploads/gradcam_example.jpg', expectedContains: '/uploads/gradcam_example.jpg' },
  { input: 'http://example.com/leaf.jpg', expected: 'http://example.com/leaf.jpg' },
  { input: 'https://example.com/leaf.jpg', expected: 'https://example.com/leaf.jpg' },
  { input: 'data:image/png;base64,iVBORw0KGgo...', expected: 'data:image/png;base64,iVBORw0KGgo...' },
  { input: null, expected: '' },
  { input: undefined, expected: '' },
  { input: '', expected: '' }
];

let passed = 0;
tests.forEach((t, i) => {
  const result = getMediaUrl(t.input);
  console.log(`Test ${i+1}: input="${t.input}" -> result="${result}"`);
  if (t.expected !== undefined && result === t.expected) {
    passed++;
  } else if (t.expectedContains && result.endsWith(t.expectedContains) && !result.includes('//uploads')) {
    passed++;
  } else {
    console.error(`FAILED test ${i+1}! Expected: ${t.expected || t.expectedContains}`);
  }
});

console.log(`\nResults: ${passed}/${tests.length} tests passed.`);
if (passed === tests.length) {
  console.log('SUCCESS: getMediaUrl contract fully verified!');
} else {
  process.exit(1);
}
