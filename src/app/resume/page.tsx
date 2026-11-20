import { PageShell, SectionHeader } from "@/components/PageShell";
import { resumeContent } from "@/content/resume";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Resume",
  description: "Experience, education, and technical skills for Dominik Peric.",
  path: "/resume",
});

const sectionClass = "border-t border-accent/25 pt-8";
const headingClass = "mb-8 font-display text-2xl text-foreground";
const labelClass = "font-mono text-[11px] uppercase tracking-[0.16em] text-muted";

export default function ResumePage() {
  const { education } = resumeContent;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow={resumeContent.name} title={resumeContent.title} />
        <div className="mt-6 text-sm leading-7 text-muted">
          <p>{resumeContent.location}</p>
          <address className="mt-2 flex flex-wrap gap-x-5 gap-y-1 not-italic">
            {resumeContent.contact.map((contact) => (
              <a
                key={contact.href}
                href={contact.href}
                target={contact.external ? "_blank" : undefined}
                rel={contact.external ? "noopener noreferrer" : undefined}
                className="!text-accent transition-colors hover:!text-brass"
              >
                {contact.label}
              </a>
            ))}
          </address>
        </div>

        <div className="mt-12 space-y-12">
          <section aria-labelledby="resume-experience" className={sectionClass}>
            <h2 id="resume-experience" className={headingClass}>
              {resumeContent.sections.experience}
            </h2>
            <div className="space-y-10">
              {resumeContent.jobs.map((job) => (
                <article key={job.company}>
                  <h3 className="font-display text-xl text-foreground">{job.company}</h3>
                  <p className="mt-1 text-base text-accent">{job.role}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                    <p className={labelClass}>{job.location}</p>
                    <p className={labelClass}>{job.dates}</p>
                  </div>
                  <ul className="prose-muted mt-5 list-disc space-y-3 pl-5 text-[15px] marker:text-accent/60">
                    {job.bullets.map((bullet) => (
                      <li key={bullet} className="pl-1">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="resume-education" className={sectionClass}>
            <h2 id="resume-education" className={headingClass}>
              {resumeContent.sections.education}
            </h2>
            <h3 className="font-display text-xl text-foreground">{education.school}</h3>
            <p className="mt-1 text-base text-accent">{education.degree}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              <p className={labelClass}>{education.location}</p>
              <p className={labelClass}>{education.dates}</p>
            </div>
            <div className="prose-muted mt-5 space-y-3 text-[15px]">
              <p>
                Specialties: {education.specialties} <span className="text-subtle">|</span> GPA:{" "}
                {education.gpa}
              </p>
              <p>Courses: {education.courses.join(", ")}</p>
            </div>
          </section>

          <section aria-labelledby="resume-skills" className={sectionClass}>
            <h2 id="resume-skills" className={headingClass}>
              {resumeContent.sections.skills}
            </h2>
            <dl className="space-y-6">
              {resumeContent.skills.map((group) => (
                <div key={group.label}>
                  <dt className={labelClass}>{group.label}</dt>
                  <dd className="prose-muted mt-2 text-[15px]">{group.items.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
