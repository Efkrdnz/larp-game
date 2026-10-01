import type { NewsScope, SectorId } from '../types';

export type EffectTarget = 'company' | 'all' | SectorId;

export interface NewsTemplate {
  id: string;
  scope: NewsScope;
  category: string;
  /** Restrict company templates to these sectors (or the sector template's target). */
  sectors?: SectorId[];
  headlines: string[];
  body: string;
  /** Effects as signed fractional moves, e.g. [0.04, 0.09] = +4%..+9%. */
  effects: { target: EffectTarget; range: [number, number] }[];
  rumorChance: number;
  weight: number;
}

// Placeholders: {name} {ticker} {ceo} {product} {sector} {pct} {city} {country}
export const CITIES = ['Port Aurum', 'New Halden', 'Lakeshore', 'Vellmont', 'Sierra Bay', 'Kingsbridge', 'Northgate'];
export const COUNTRIES = ['Borovia', 'Kestania', 'the Republic of Aldmoor', 'Valdoria', 'the Eastern Coalition'];

export const NEWS_TEMPLATES: NewsTemplate[] = [
  // ---------- Company: positive ----------
  {
    id: 'earnings-beat', scope: 'company', category: 'Earnings',
    headlines: ['{name} smashes earnings estimates, shares jump', '{name} posts record quarter as {product} sales soar', '{ticker} crushes Wall Street expectations'],
    body: '{name} reported quarterly profit well above analyst forecasts. CEO {ceo} credited strong demand for the {product} and raised full-year guidance.',
    effects: [{ target: 'company', range: [0.04, 0.12] }], rumorChance: 0, weight: 8,
  },
  {
    id: 'contract-win', scope: 'company', category: 'Deals',
    headlines: ['{name} wins multi-billion government contract', '{name} lands mega-deal with the government of {country}'],
    body: 'In a major coup, {name} secured a long-term contract. Analysts say the deal could add {pct}% to annual revenue.',
    effects: [{ target: 'company', range: [0.05, 0.11] }], rumorChance: 0.15, weight: 4,
    sectors: ['industrial', 'tech', 'energy', 'health', 'auto'],
  },
  {
    id: 'takeover-rumor', scope: 'company', category: 'M&A',
    headlines: ['Sources: {name} in secret takeover talks', 'Report: rival weighing premium bid for {name}', '{ticker} soars on buyout chatter'],
    body: 'People familiar with the matter say a larger competitor is preparing an offer for {name} at a significant premium. {name} declined to comment.',
    effects: [{ target: 'company', range: [0.08, 0.2] }], rumorChance: 0.55, weight: 3,
  },
  {
    id: 'product-launch', scope: 'company', category: 'Products',
    headlines: ['{name} unveils {product} to rave reviews', 'Lines around the block for the new {product}', '{product} is the must-have of the season'],
    body: 'Early reviews of the {product} are glowing. Pre-orders reportedly exceeded internal targets by a wide margin, according to {ceo}.',
    effects: [{ target: 'company', range: [0.03, 0.08] }], rumorChance: 0.1, weight: 5,
    sectors: ['tech', 'auto', 'consumer', 'media'],
  },
  {
    id: 'drug-approval', scope: 'company', category: 'Regulatory',
    headlines: ['Regulators approve {name}\'s {product}', '{name} wins approval for {product}, shares rocket'],
    body: 'The national drug agency granted full approval to the {product}, opening a market analysts estimate in the tens of billions.',
    effects: [{ target: 'company', range: [0.1, 0.35] }], rumorChance: 0.1, weight: 3,
    sectors: ['health'],
  },
  {
    id: 'upgrade', scope: 'company', category: 'Analysts',
    headlines: ['Goldstein upgrades {ticker} to "Strong Buy"', 'Analyst: {name} could double from here'],
    body: 'A prominent analyst raised the price target on {name}, citing undervalued growth in the {product} business.',
    effects: [{ target: 'company', range: [0.02, 0.05] }], rumorChance: 0.4, weight: 5,
  },
  {
    id: 'buyback', scope: 'company', category: 'Corporate',
    headlines: ['{name} announces massive share buyback', '{name} to return billions to shareholders'],
    body: '{name}\'s board authorised a buyback worth roughly {pct}% of market value, a sign of confidence from {ceo}.',
    effects: [{ target: 'company', range: [0.03, 0.07] }], rumorChance: 0, weight: 3,
  },
  {
    id: 'ceo-viral', scope: 'company', category: 'Social',
    headlines: ['{ceo} posts cryptic meme; {ticker} retail traders pile in', 'Meme army targets {ticker}: "to the moon"'],
    body: 'A viral post from {ceo} sent retail traders into a frenzy. Short sellers are reportedly scrambling as volume spikes.',
    effects: [{ target: 'company', range: [0.06, 0.25] }], rumorChance: 0.85, weight: 2,
    sectors: ['tech', 'auto', 'media'],
  },
  // ---------- Company: negative ----------
  {
    id: 'earnings-miss', scope: 'company', category: 'Earnings',
    headlines: ['{name} misses estimates, cuts guidance', '{ticker} tumbles after disappointing quarter', 'Ugly quarter for {name} as {product} demand slows'],
    body: '{name} reported revenue below expectations and warned of a weaker outlook. CEO {ceo} blamed "macro headwinds".',
    effects: [{ target: 'company', range: [-0.13, -0.04] }], rumorChance: 0, weight: 8,
  },
  {
    id: 'recall', scope: 'company', category: 'Products',
    headlines: ['{name} recalls millions of {product} units', 'Safety scare: {product} recall widens'],
    body: '{name} announced a recall after reports of defects. The cost could run into billions, and lawsuits are expected.',
    effects: [{ target: 'company', range: [-0.12, -0.04] }], rumorChance: 0.1, weight: 4,
    sectors: ['auto', 'tech', 'consumer', 'health'],
  },
  {
    id: 'ceo-scandal', scope: 'company', category: 'Scandal',
    headlines: ['{name} CEO {ceo} under fire over expense scandal', '{ceo} resigns from {name} amid misconduct probe', 'Leaked emails embarrass {name} leadership'],
    body: 'Documents obtained by the Daily Ledger raise serious questions about {ceo}\'s conduct. The board has called an emergency meeting.',
    effects: [{ target: 'company', range: [-0.15, -0.05] }], rumorChance: 0.3, weight: 3,
  },
  {
    id: 'fraud-probe', scope: 'company', category: 'Regulatory',
    headlines: ['Regulators open fraud probe into {name}', 'Short seller accuses {name} of "cooking the books"'],
    body: 'The Securities Commission confirmed an investigation into accounting at {name}. A short-seller report alleges inflated revenue.',
    effects: [{ target: 'company', range: [-0.25, -0.08] }], rumorChance: 0.35, weight: 2,
  },
  {
    id: 'data-breach', scope: 'company', category: 'Tech',
    headlines: ['Massive data breach hits {name}', 'Hackers steal millions of records from {name}'],
    body: 'Hackers accessed customer data at {name}. Regulators in several countries are demanding answers.',
    effects: [{ target: 'company', range: [-0.09, -0.03] }], rumorChance: 0.1, weight: 3,
    sectors: ['tech', 'finance', 'media', 'consumer'],
  },
  {
    id: 'trial-fail', scope: 'company', category: 'Regulatory',
    headlines: ['{name}\'s {product} fails late-stage trial', '{ticker} craters as key trial misses endpoint'],
    body: 'The {product} did not meet its primary endpoint, a devastating blow to {name}\'s pipeline.',
    effects: [{ target: 'company', range: [-0.4, -0.15] }], rumorChance: 0.1, weight: 2,
    sectors: ['health'],
  },
  {
    id: 'downgrade', scope: 'company', category: 'Analysts',
    headlines: ['Analyst downgrades {ticker} to "Sell"', 'Bearish note: {name} "priced for perfection"'],
    body: 'A widely followed analyst slashed the price target on {name}, citing competitive pressure on the {product}.',
    effects: [{ target: 'company', range: [-0.05, -0.02] }], rumorChance: 0.4, weight: 5,
  },
  {
    id: 'strike', scope: 'company', category: 'Labor',
    headlines: ['Workers strike at {name} plants', '{name} production halted by walkout'],
    body: 'Thousands of {name} workers walked off the job demanding higher wages. Production of the {product} is halted.',
    effects: [{ target: 'company', range: [-0.08, -0.03] }], rumorChance: 0.1, weight: 3,
    sectors: ['auto', 'industrial', 'consumer', 'energy'],
  },
  {
    id: 'accident', scope: 'company', category: 'Disaster',
    headlines: ['Explosion at {name} facility near {city}', 'Disaster at {name}\'s {product}'],
    body: 'An accident at a {name} site near {city} forced evacuations. The cleanup bill and fines could be enormous.',
    effects: [{ target: 'company', range: [-0.16, -0.06] }], rumorChance: 0.05, weight: 2,
    sectors: ['energy', 'industrial'],
  },
  // ---------- Sector ----------
  {
    id: 'oil-spike', scope: 'sector', category: 'Commodities',
    headlines: ['Oil spikes as conflict flares in {country}', 'Crude jumps {pct}% on supply fears'],
    body: 'Crude prices surged on fears of supply disruption. Energy producers rallied while airlines and carmakers slid.',
    effects: [{ target: 'energy', range: [0.03, 0.08] }, { target: 'auto', range: [-0.04, -0.01] }, { target: 'industrial', range: [-0.03, -0.01] }],
    rumorChance: 0.1, weight: 3,
  },
  {
    id: 'oil-crash', scope: 'sector', category: 'Commodities',
    headlines: ['Oil plunges as producers flood the market', 'Crude collapses {pct}% in price war'],
    body: 'A price war among producers sent oil tumbling. Drillers were hammered while transport stocks cheered.',
    effects: [{ target: 'energy', range: [-0.09, -0.03] }, { target: 'auto', range: [0.01, 0.03] }, { target: 'industrial', range: [0.01, 0.03] }],
    rumorChance: 0.1, weight: 2,
  },
  {
    id: 'chip-shortage', scope: 'sector', category: 'Supply chain',
    headlines: ['Chip shortage worsens; automakers cut output', 'Fab fire in {country} threatens global chip supply'],
    body: 'A supply shock in semiconductors is rippling through the economy. Chipmakers gain pricing power while carmakers idle lines.',
    effects: [{ target: 'tech', range: [0.01, 0.04] }, { target: 'auto', range: [-0.07, -0.02] }],
    rumorChance: 0.15, weight: 2,
  },
  {
    id: 'ai-boom', scope: 'sector', category: 'Tech',
    headlines: ['AI frenzy lifts tech stocks to record', 'Investors pile into anything with "AI" in the pitch deck'],
    body: 'A wave of AI optimism swept markets. Tech led gains as investors bet on a productivity boom.',
    effects: [{ target: 'tech', range: [0.03, 0.08] }, { target: 'media', range: [0.0, 0.03] }],
    rumorChance: 0.2, weight: 3,
  },
  {
    id: 'tech-regulation', scope: 'sector', category: 'Politics',
    headlines: ['Parliament moves to break up Big Tech', 'Sweeping tech regulation bill advances'],
    body: 'Lawmakers advanced a bill that would impose strict rules on large technology platforms. Lobbyists are scrambling.',
    effects: [{ target: 'tech', range: [-0.07, -0.02] }, { target: 'media', range: [-0.06, -0.02] }],
    rumorChance: 0.3, weight: 2,
  },
  {
    id: 'drug-pricing', scope: 'sector', category: 'Politics',
    headlines: ['Government vows crackdown on drug prices', 'Drug-price cap bill gains momentum'],
    body: 'The government signalled it will cap the price of prescription drugs. Pharma stocks slid on margin fears.',
    effects: [{ target: 'health', range: [-0.07, -0.02] }],
    rumorChance: 0.25, weight: 2,
  },
  {
    id: 'ev-subsidy', scope: 'sector', category: 'Politics',
    headlines: ['Huge EV subsidy package passes', 'Government announces green-energy stimulus'],
    body: 'A new subsidy programme will funnel billions into electric vehicles and renewable energy over the next decade.',
    effects: [{ target: 'auto', range: [0.02, 0.06] }, { target: 'energy', range: [0.01, 0.04] }],
    rumorChance: 0.2, weight: 2,
  },
  {
    id: 'bank-stress', scope: 'sector', category: 'Finance',
    headlines: ['Regional bank collapse rattles financials', 'Bank run fears spread after mid-size lender fails'],
    body: 'The failure of a mid-sized lender has investors questioning bank balance sheets. Financials sold off sharply.',
    effects: [{ target: 'finance', range: [-0.1, -0.03] }, { target: 'all', range: [-0.02, -0.005] }],
    rumorChance: 0.15, weight: 2,
  },
  {
    id: 'consumer-boom', scope: 'sector', category: 'Economy',
    headlines: ['Retail sales surge; shoppers keep spending', 'Holiday spending smashes records'],
    body: 'Consumers are spending freely, boosting retailers and restaurant chains.',
    effects: [{ target: 'consumer', range: [0.02, 0.05] }],
    rumorChance: 0, weight: 3,
  },
  {
    id: 'infrastructure', scope: 'sector', category: 'Politics',
    headlines: ['Trillion-dollar infrastructure bill signed', 'Government to rebuild every bridge in the country'],
    body: 'A massive infrastructure package will fund roads, rail and bridges. Construction and steel stocks surged.',
    effects: [{ target: 'industrial', range: [0.03, 0.07] }],
    rumorChance: 0.2, weight: 2,
  },
  {
    id: 'streaming-war', scope: 'sector', category: 'Media',
    headlines: ['Streaming price war erupts', 'Ad market slumps; media stocks sink'],
    body: 'Media companies are cutting prices and budgets as advertising dries up.',
    effects: [{ target: 'media', range: [-0.06, -0.02] }],
    rumorChance: 0.1, weight: 2,
  },
  // ---------- Macro ----------
  {
    id: 'rate-hike', scope: 'macro', category: 'Central Bank',
    headlines: ['Central bank hikes rates, signals more to come', 'Surprise rate hike rattles markets'],
    body: 'The central bank raised its benchmark rate to fight inflation. Banks benefit from wider margins; growth stocks fell.',
    effects: [{ target: 'all', range: [-0.03, -0.01] }, { target: 'finance', range: [0.01, 0.03] }, { target: 'tech', range: [-0.03, -0.01] }],
    rumorChance: 0.1, weight: 2,
  },
  {
    id: 'rate-cut', scope: 'macro', category: 'Central Bank',
    headlines: ['Central bank cuts rates; stocks rally', 'Easy money is back: rates slashed'],
    body: 'In a bid to support growth the central bank cut rates. Risk assets rallied across the board.',
    effects: [{ target: 'all', range: [0.01, 0.035] }, { target: 'tech', range: [0.01, 0.03] }],
    rumorChance: 0.1, weight: 2,
  },
  {
    id: 'jobs-strong', scope: 'macro', category: 'Economy',
    headlines: ['Blowout jobs report: economy adds 400k jobs', 'Unemployment hits record low'],
    body: 'The labour market remains red hot, easing recession fears.',
    effects: [{ target: 'all', range: [0.005, 0.02] }],
    rumorChance: 0, weight: 3,
  },
  {
    id: 'recession', scope: 'macro', category: 'Economy',
    headlines: ['Recession fears grip markets', 'GDP shrinks unexpectedly; "R-word" returns'],
    body: 'Economic output contracted, raising fears of a recession. Defensive sectors held up better than cyclicals.',
    effects: [{ target: 'all', range: [-0.04, -0.015] }, { target: 'health', range: [0.005, 0.02] }],
    rumorChance: 0.1, weight: 2,
  },
  {
    id: 'war', scope: 'macro', category: 'Geopolitics',
    headlines: ['Tensions explode between {country} and neighbours', 'Military escalation in {country} sparks sell-off'],
    body: 'Escalating conflict sent investors fleeing to safety. Defense contractors and oil rose; most else fell.',
    effects: [{ target: 'all', range: [-0.04, -0.015] }, { target: 'industrial', range: [0.02, 0.05] }, { target: 'energy', range: [0.02, 0.06] }],
    rumorChance: 0.2, weight: 1,
  },
  {
    id: 'peace', scope: 'macro', category: 'Geopolitics',
    headlines: ['Ceasefire agreed in {country}; markets cheer', 'Historic trade deal signed with {country}'],
    body: 'A diplomatic breakthrough lifted sentiment. Investors returned to riskier assets.',
    effects: [{ target: 'all', range: [0.01, 0.03] }],
    rumorChance: 0.15, weight: 1,
  },
  {
    id: 'tax-cut', scope: 'macro', category: 'Politics',
    headlines: ['Corporate tax cut passes parliament', 'Billionaires celebrate as tax bill clears final vote'],
    body: 'The corporate tax rate is going down. Companies (and their shareholders) are delighted.',
    effects: [{ target: 'all', range: [0.015, 0.04] }],
    rumorChance: 0.2, weight: 1,
  },
  {
    id: 'inflation-hot', scope: 'macro', category: 'Economy',
    headlines: ['Inflation runs hotter than expected', 'Prices surge again; consumers squeezed'],
    body: 'Consumer prices rose faster than forecast, raising bets on tighter policy.',
    effects: [{ target: 'all', range: [-0.025, -0.005] }, { target: 'consumer', range: [-0.03, -0.01] }],
    rumorChance: 0, weight: 2,
  },
  {
    id: 'election', scope: 'macro', category: 'Politics',
    headlines: ['Polls tighten ahead of election in a nail-biter', 'Business-friendly candidate surges in polls'],
    body: 'Markets are reacting to shifting election odds as the business lobby pours money into campaigns.',
    effects: [{ target: 'all', range: [-0.015, 0.025] }],
    rumorChance: 0.3, weight: 1,
  },
];
