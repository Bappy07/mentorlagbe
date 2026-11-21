
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Nusrat Jahan",
    role: "University Student",
    initials: "NJ",
    review:
      "Finding a suitable tutor used to take so much time. MentorLagbe makes it easier to explore opportunities and find the right academic support.",
  },
  {
    name: "Tanvir Ahmed",
    role: "Private Tutor",
    initials: "TA",
    review:
      "A simple way to discover tuition opportunities. I like how everything is organized in one place instead of searching through different groups.",
  },
  {
    name: "Farhana Rahman",
    role: "University Student",
    initials: "FR",
    review:
      "The platform makes the connection between students and tutors feel much more straightforward. I look forward to using it for my studies.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#F5F7F3] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF1E5] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#527C69]">
            <Quote size={14} />
            Community stories
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#102B25] sm:text-4xl">
            What our community says
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64736B]">
            Discover how students and tutors experience a simpler way
            to connect through MentorLagbe.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex flex-col rounded-2xl border border-[#E3EAE0] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(16,43,37,0.07)]"
            >
              <div className="flex items-center gap-1 text-[#D5A82E]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <div className="mt-6 flex-1">
                <Quote
                  size={25}
                  className="text-[#B9CCAE]"
                  fill="currentColor"
                />

                <p className="mt-4 text-sm leading-7 text-[#64736B]">
                  "{testimonial.review}"
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-[#EDF1EB] pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF1E5] text-sm font-extrabold text-[#42634F]">
                  {testimonial.initials}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#102B25]">
                    {testimonial.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#829187]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[#829187]">
          Sample testimonials for the platform preview.
        </p>
      </div>
    </section>
  );
}
