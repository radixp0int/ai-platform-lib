import type { GreetingProps } from './types'
function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * The empty conversation's headline, in two tones: the greeting in ink, then
 * the assistant's question in a quieter colour. One heading, so it is read as
 * one sentence. The assistant's mark is not here — it sits in the composer,
 * beside the question it is typing.
 */
export function Greeting({
  name,
  salutation = greeting(),
  question = 'What are we working on?',
}: GreetingProps) {
  return (
    <h1 className="text-[30px] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance text-ink-strong sm:text-[42px] lg:text-[50px]">
      {salutation}, {name}.
      <br />
      <span className="text-ink-soft">{question}</span>
    </h1>
  )
}
