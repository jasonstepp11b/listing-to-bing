const steps = [
  {
    title: 'Paste your listing',
    description: 'Give us the description, city, and price.',
  },
  {
    title: 'Get your campaign',
    description: 'In about 2 minutes, we generate keywords, ad copy, and a landing page.',
  },
  {
    title: 'Run the ads',
    description: 'Copy everything into Microsoft Ads and start collecting buyer leads.',
  },
]

export function LandingHero() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
        Turn any property listing into a Bing Ads campaign in seconds.
      </h1>
      <p className="text-lg text-slate-500 leading-relaxed mb-10">
        Built for real estate agents who want more buyer leads - without burning their budget on the wrong clicks.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-200 pt-8">
        {steps.map((step, i) => (
          <div key={i}>
            <p className="text-xs font-bold text-slate-400 mb-1.5">{i + 1}</p>
            <p className="text-sm font-semibold text-slate-800 mb-1">{step.title}</p>
            <p className="text-sm text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
