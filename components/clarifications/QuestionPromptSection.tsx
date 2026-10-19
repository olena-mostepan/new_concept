export function QuestionPromptSection({
  question,
  linkedField,
}: {
  question: string
  linkedField?: string | null
}) {
  return (
    <section className="rounded-xl border border-[rgba(28,117,188,0.15)] bg-[rgba(28,117,188,0.055)] px-5 py-4 sm:p-6">
      <h2 className="text-xs font-bold uppercase tracking-wide text-cq-text-secondary">
        Question
      </h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-cq-text">
        {question}
      </p>
      {linkedField ? (
        <p className="mt-3 text-xs text-cq-text-secondary">
          Linked field: <span className="font-semibold text-cq-text">{linkedField}</span>
        </p>
      ) : null}
    </section>
  )
}
