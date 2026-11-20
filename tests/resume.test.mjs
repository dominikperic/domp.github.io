import assert from "node:assert/strict";
import test from "node:test";

// Run against a local Next.js server: node --test tests/resume.test.mjs
const baseUrl = process.env.RESUME_TEST_URL ?? "http://localhost:3000";

test("/resume renders the supplied work, education, and skills without personal projects", async () => {
  const response = await fetch(new URL("/resume", baseUrl));
  assert.equal(response.status, 200);
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, "resume has a main landmark");
  for (const heading of ["Experience", "Education", "Skills"]) {
    assert.match(main, new RegExp(`<h2\\b[^>]*>${heading}</h2>`));
  }
  const text = main.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const fact of [
    "Dominik Peric",
    "Chicago, IL",
    "Neretva Group",
    "Data Engineer",
    "July 2026 – Present",
    "747,000+",
    "PCI DSS",
    "K-Means and K-Prototypes",
    "Data Sleek",
    "Data Engineer Intern",
    "Remote",
    "June 2024 – September 2024",
    "targeting a 15%",
    "targeting a 25%",
    "Georgia Institute of Technology",
    "Bachelor of Science in Computer Science",
    "August 2023 – August 2026",
    "Intelligence and Media",
    "GPA: 3.5",
    "Objects and Design",
    "Languages",
    "Frameworks",
    "Tools",
    "TypeScript",
    "scikit-learn",
    "Unity Catalog",
    "CI/CD",
  ]) {
    assert.ok(text.includes(fact), `missing resume fact: ${fact}`);
  }
  assert.equal((main.match(/<li\b/g) ?? []).length, 12, "all 12 experience bullets render");
  assert.match(
    main,
    /href="https:\/\/github.com\/dominikperic"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
  );
  assert.match(main, /href="mailto:dominikperic3@gmail.com"/);
  assert.match(main, /href="tel:\+18473290008"/);
  assert.doesNotMatch(main, /projects|sorting animation|sorting-animation/i);
});
