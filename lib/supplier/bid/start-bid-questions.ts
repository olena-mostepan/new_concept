export type StartBidQuestion = {
  id: string
  label: string
  required?: boolean
}

export type StartBidSection = {
  id: string
  title: string
  questions: StartBidQuestion[]
}

export const START_BID_SECTIONS: StartBidSection[] = [
  {
    id: 'project-approach',
    title: 'Project Approach',
    questions: [
      {
        id: 'plan',
        label: 'How do you plan to complete this project?',
        required: true,
      },
    ],
  },
  {
    id: 'availability',
    title: 'Availability and Timescales',
    questions: [
      {
        id: 'kickoff',
        label: 'When would you prefer to kick-off this project?',
        required: true,
      },
      {
        id: 'contract-lead-time',
        label:
          'How much lead time do you typically need for finalising contracts and mobilisation?',
        required: true,
      },
      {
        id: 'equipment-lead-time',
        label:
          'How much time do you expect to need for equipment lead time and delivery?',
        required: true,
      },
      {
        id: 'installation',
        label: 'How much time do you need for installation works?',
      },
      {
        id: 'commissioning',
        label:
          'How much time do you need for commissioning, testing and system verification?',
      },
      {
        id: 'timescale-factors',
        label:
          'Please briefly describe any factors that may affect your estimated project timescale.',
      },
    ],
  },
  {
    id: 'hss',
    title: 'Health, Safety and Sustainability',
    questions: [
      {
        id: 'hs-policy',
        label: "Please provide a copy of your company's health and safety policy document.",
      },
      {
        id: 'esg-policy',
        label:
          "Please provide a copy of your company's ESG (environmental, social, and governance) policy.",
      },
      {
        id: 'indemnity',
        label:
          "What is the value of your company's private indemnity insurance that is related to this work?",
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    questions: [
      {
        id: 'total-price',
        label: 'What is the total price of your bid?',
        required: true,
      },
      {
        id: 'price-breakdown',
        label: 'Upload your price breakdown',
      },
      {
        id: 'labour',
        label: 'What is the approximate allowance in your bid for labour?',
      },
      {
        id: 'materials',
        label: 'What is the approximate allowance in your bid for materials?',
      },
      {
        id: 'admin',
        label:
          'What is the approximate allowance in your bid for administration, planning and project management?',
      },
      {
        id: 'access-hs',
        label:
          'What is the approximate allowance in your bid for access, health and safety?',
      },
      {
        id: 'electrical',
        label: 'What is the approximate allowance in your bid for electrical work?',
      },
      {
        id: 'maintenance-cost',
        label: 'What is the annual cost for maintenance and servicing?',
      },
      {
        id: 'maintenance-period',
        label: 'What is the period of the maintenance offering?',
      },
      {
        id: 'maintenance-approach',
        label: 'Please outline the approach in your tender to maintenance and servicing.',
      },
    ],
  },
  {
    id: 'cost-efficiency',
    title: 'Cost and Efficiency Estimates',
    questions: [
      {
        id: 'efficiency-savings',
        label: 'What are the estimated efficiency and cost savings of your bid?',
        required: true,
      },
      {
        id: 'efficiency-doc',
        label: 'Upload your efficiency and costs savings document',
      },
      {
        id: 'simulation',
        label: 'Upload your simulation / modelling',
      },
    ],
  },
  {
    id: 'lifetime',
    title: 'Lifetime',
    questions: [
      {
        id: 'lifetime',
        label: 'What is the lifetime of your proposed solution?',
        required: true,
      },
      {
        id: 'lifetime-extension',
        label:
          "If your solution's overall lifetime can be extended through the replacement of parts, please provide details here.",
      },
    ],
  },
  {
    id: 'lamps',
    title: 'Lamps and Luminaires',
    questions: [
      {
        id: 'luminaires',
        label: 'How many luminaires are you proposing to install?',
        required: true,
      },
      {
        id: 'lamps',
        label: 'How many lamps are you proposing to install?',
        required: true,
      },
    ],
  },
  {
    id: 'energy',
    title: 'Energy Demand and Consumption',
    questions: [
      {
        id: 'energy-demand',
        label: 'What is the total energy demand of your solution?',
        required: true,
      },
      {
        id: 'energy-consumption',
        label: 'What is the total energy consumption of your solution per annum?',
        required: true,
      },
      {
        id: 'running-hours',
        label: 'What is the total running hours of your lamps per annum?',
        required: true,
      },
      {
        id: 'lifetime-consumption',
        label: 'What is the total energy consumption over the lifetime of your solution?',
        required: true,
      },
    ],
  },
  {
    id: 'durability',
    title: 'Durability',
    questions: [
      {
        id: 'durability',
        label: 'What is the durability of your lamps?',
        required: true,
      },
      {
        id: 'durability-standard',
        label: 'Which standard is this measured under?',
      },
    ],
  },
  {
    id: 'component-warranties',
    title: 'Component Warranties',
    questions: [
      {
        id: 'lamp-warranty',
        label: 'What is the warranty length of your lamps?',
        required: true,
      },
      {
        id: 'other-warranty',
        label: 'What is the warranty length for the other components of your solution?',
        required: true,
      },
    ],
  },
  {
    id: 'workmanship',
    title: 'Workmanship Warranty',
    questions: [
      {
        id: 'workmanship-warranty',
        label: 'What is the workmanship warranty of your proposed solution?',
        required: true,
      },
      {
        id: 'anything-else',
        label: "Is there anything else you'd like to tell us about your bid?",
      },
    ],
  },
]
