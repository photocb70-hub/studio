
export type DrugInfo = {
  name: string;
  uses: string;
  sideEffects: string;
};

export type DrugCategory = {
  title: string;
  drugs: DrugInfo[];
};

export const drugCategories: DrugCategory[] = [
  {
    title: 'Prescription Drugs',
    drugs: [
      {
        name: 'Tramadol',
        uses: 'Moderate to severe pain relief.',
        sideEffects: 'Can cause blurred vision and miosis (pupil constriction). Reports of nystagmus and visual disturbances are less common.',
      },
      {
        name: 'Fluoxetine (Prozac)',
        uses: 'Antidepressant (SSRI) for depression, obsessive-compulsive disorder, and panic disorder.',
        sideEffects: 'Blurred vision, mydriasis (pupil dilation) which can precipitate angle-closure glaucoma in susceptible individuals, dry eye syndrome.',
      },
      {
        name: 'Propranolol',
        uses: 'Beta-blocker for hypertension, angina, anxiety, and migraine prevention.',
        sideEffects: 'Dry eyes, blurred vision, reduced intraocular pressure. Caution in patients using topical beta-blockers for glaucoma.',
      },
      {
        name: 'Atenolol',
        uses: 'Beta-blocker for hypertension and angina.',
        sideEffects: 'Similar to other beta-blockers: dry eyes, blurred vision, and potential for reduced intraocular pressure.',
      },
      {
        name: 'Prednisolone',
        uses: 'Corticosteroid for a wide range of inflammatory and autoimmune conditions.',
        sideEffects: 'Posterior subcapsular cataracts, increased intraocular pressure (steroid-induced glaucoma), central serous chorioretinopathy.',
      },
      {
        name: 'Isotretinoin (Roaccutane)',
        uses: 'Severe acne.',
        sideEffects: 'Severe dry eye, blepharitis, conjunctivitis, decreased night vision, and corneal opacities. Intracranial hypertension (pseudotumor cerebri) can cause papilledema.',
      },
      {
        name: 'Hydroxychloroquine',
        uses: 'Rheumatoid arthritis, lupus, and malaria.',
        sideEffects: 'Classic "bull\'s-eye" maculopathy, a potentially irreversible retinal toxicity. Requires regular ophthalmic screening.',
      },
      {
        name: 'Amiodarone',
        uses: 'Cardiac arrhythmias.',
        sideEffects: 'Corneal microdeposits (vortex keratopathy) are very common but usually asymptomatic. Optic neuropathy is a rare but serious side effect.',
      },
      {
        name: 'Tamsulosin',
        uses: 'Benign prostatic hyperplasia (BPH).',
        sideEffects: 'Intraoperative Floppy Iris Syndrome (IFIS), which can complicate cataract surgery. Surgeons must be informed if a patient is taking this drug.',
      },
      {
        name: 'Sildenafil (Viagra)',
        uses: 'Erectile dysfunction.',
        sideEffects: 'Blue-tinged vision (cyanopsia), light sensitivity, blurred vision. Non-arteritic anterior ischemic optic neuropathy (NAION) is a rare but serious risk.',
      },
      {
        name: 'Topiramate',
        uses: 'Epilepsy and migraine prevention.',
        sideEffects: 'Acute angle-closure glaucoma, myopic shift, and visual field defects. These are idiosyncratic reactions that can occur shortly after starting the drug.',
      },
      {
        name: 'Ethambutol',
        uses: 'Tuberculosis.',
        sideEffects: 'Dose-related optic neuropathy, which can cause decreased visual acuity and colour vision defects (especially red-green). Requires baseline and regular monitoring.',
      },
      {
        name: 'Tamoxifen',
        uses: 'Treatment and prevention of breast cancer.',
        sideEffects: 'Crystalline retinopathy, macular edema, and corneal changes. Optic neuritis is a rare complication.',
      },
      {
        name: 'Digoxin',
        uses: 'Heart failure and atrial fibrillation.',
        sideEffects: 'Yellow-green tinted vision (xanthopsia), blurred vision, and "halos" around lights, which can be signs of toxicity.',
      },
      {
        name: 'Indomethacin',
        uses: 'NSAID for pain and inflammation, particularly in arthritis and gout.',
        sideEffects: 'Corneal deposits (keratopathy) and macular disturbances with long-term use.',
      },
      {
        name: 'Bisphosphonates (e.g., Alendronate)',
        uses: 'Osteoporosis.',
        sideEffects: 'Can cause inflammatory eye conditions such as conjunctivitis, uveitis, scleritis, and episcleritis.',
      },
      {
        name: 'Gabapentin',
        uses: 'Epilepsy, neuropathic pain, and restless leg syndrome.',
        sideEffects: 'Nystagmus (involuntary eye movements), diplopia (double vision), and blurred vision are commonly reported.',
      },
      {
        name: 'Citalopram',
        uses: 'Antidepressant (SSRI) for depression and panic disorder.',
        sideEffects: 'Similar to other SSRIs: blurred vision, dry eye, and risk of mydriasis which can precipitate angle-closure glaucoma.',
      },
      {
        name: 'Sertraline',
        uses: 'Antidepressant (SSRI) for depression, OCD, PTSD, and social anxiety disorder.',
        sideEffects: 'Risk of mydriasis (can trigger angle-closure), blurred vision, and dry eye syndrome.',
      },
      {
        name: 'Amitriptyline',
        uses: 'Tricyclic antidepressant for depression and neuropathic pain.',
        sideEffects: 'Strong anticholinergic effects causing blurred vision due to cycloplegia, mydriasis (risk of angle-closure glaucoma), and severe dry eye.',
      },
      {
        name: 'Vigabatrin',
        uses: 'Epilepsy, especially infantile spasms.',
        sideEffects: 'Causes permanent, bilateral concentric visual field loss in a significant percentage of patients. Regular perimetry is mandatory.',
      },
      {
        name: 'Chlorpromazine',
        uses: 'Antipsychotic for schizophrenia and other psychotic disorders.',
        sideEffects: 'Pigmentary changes in the cornea, lens (anterior subcapsular cataracts), and retina with long-term, high-dose use.',
      },
    ]
  },
  {
    title: 'In-Practice Ophthalmic Drugs',
    drugs: [
        {
            name: 'Proxymetacaine Hydrochloride',
            uses: 'Topical local anaesthetic for tonometry, contact lens fitting, and minor procedures. Rapid onset, short duration.',
            sideEffects: 'Mild stinging on instillation. Corneal epithelial toxicity with repeated use. Rare allergic reactions.',
        },
        {
            name: 'Oxybuprocaine Hydrochloride',
            uses: 'Topical local anaesthetic for tonometry and minor procedures. Can cause more stinging than Proxymetacaine.',
            sideEffects: 'Stinging on instillation, potential for corneal epithelial toxicity with overuse. Rare allergic reactions.',
        },
        {
            name: 'Tropicamide',
            uses: 'Anticholinergic agent used for mydriasis (pupil dilation) and cycloplegia (paralysis of accommodation) for fundus examination.',
            sideEffects: 'Stinging, light sensitivity (photophobia), blurred near vision. Can increase intraocular pressure and precipitate acute angle-closure glaucoma in at-risk eyes.',
        },
        {
            name: 'Cyclopentolate Hydrochloride',
            uses: 'Potent anticholinergic for mydriasis and cycloplegia, especially for paediatric refraction.',
            sideEffects: 'More pronounced and longer-lasting effects than Tropicamide. Can cause CNS effects, especially in children (e.g., drowsiness, disorientation, hallucinations).',
        },
        {
            name: 'Phenylephrine Hydrochloride',
            uses: 'Sympathomimetic agent used for mydriasis without cycloplegia. Often used with Tropicamide for maximum dilation.',
            sideEffects: 'Can cause significant cardiovascular effects (increased blood pressure, tachycardia). Use with caution in patients with hypertension, heart disease, or on MAOIs.',
        },
        {
            name: 'Fluorescein Sodium',
            uses: 'Diagnostic dye used topically (as strips) to assess corneal integrity, tear film quality (TBUT), and applanation tonometry.',
            sideEffects: 'Minimal. Can cause mild stinging. Stains soft contact lenses.',
        },
        {
            name: 'Chloramphenicol',
            uses: 'Broad-spectrum antibiotic (POM) for the treatment of bacterial conjunctivitis and other superficial eye infections. Available under PGDs for optometrists.',
            sideEffects: 'Generally well-tolerated. Rare but serious risk of aplastic anaemia with systemic use; topical risk is considered extremely low but not zero.',
        },
        {
            name: 'Fusidic Acid',
            uses: 'Antibiotic (POM) with strong activity against staphylococcal infections, commonly prescribed for bacterial conjunctivitis or blepharitis.',
            sideEffects: 'Transient stinging or blurring. Often prescribed as a viscous drop.',
        },
    ]
  },
  {
    title: 'Over-the-Counter & Other',
    drugs: [
      {
        name: 'Aspirin',
        uses: 'Pain relief, anti-inflammatory, antiplatelet (to prevent blood clots).',
        sideEffects: 'Subconjunctival hemorrhage. High doses may increase risk of retinal and macular hemorrhage.',
      },
      {
        name: 'Cetirizine',
        uses: 'Antihistamine for allergic rhinitis (hay fever) and urticaria (hives).',
        sideEffects: 'Dry eyes, blurred vision. Can cause pupil dilation (mydriasis), use with caution in patients at risk for angle-closure glaucoma.',
      },
       {
        name: 'Scopolamine (Hyoscine)',
        uses: 'Motion sickness and postoperative nausea.',
        sideEffects: 'Significant mydriasis (pupil dilation) and cycloplegia (loss of accommodation), leading to blurred vision and photophobia. Can trigger angle-closure glaucoma.',
      },
    ]
  }
];

// This is the old flat list, which is now replaced by the categorized list above.
// It's kept here for reference but is no longer used by the application.
export const drugData: DrugInfo[] = [
  {
    name: 'Aspirin',
    uses: 'Pain relief, anti-inflammatory, antiplatelet (to prevent blood clots).',
    sideEffects: 'Subconjunctival hemorrhage. High doses may increase risk of retinal and macular hemorrhage.',
  },
  {
    name: 'Tramadol',
    uses: 'Moderate to severe pain relief.',
    sideEffects: 'Can cause blurred vision and miosis (pupil constriction). Reports of nystagmus and visual disturbances are less common.',
  },
  {
    name: 'Fluoxetine (Prozac)',
    uses: 'Antidepressant (SSRI) for depression, obsessive-compulsive disorder, and panic disorder.',
    sideEffects: 'Blurred vision, mydriasis (pupil dilation) which can precipitate angle-closure glaucoma in susceptible individuals, dry eye syndrome.',
  },
  {
    name: 'Propranolol',
    uses: 'Beta-blocker for hypertension, angina, anxiety, and migraine prevention.',
    sideEffects: 'Dry eyes, blurred vision, reduced intraocular pressure. Caution in patients using topical beta-blockers for glaucoma.',
  },
  {
    name: 'Atenolol',
    uses: 'Beta-blocker for hypertension and angina.',
    sideEffects: 'Similar to other beta-blockers: dry eyes, blurred vision, and potential for reduced intraocular pressure.',
  },
  {
    name: 'Prednisolone',
    uses: 'Corticosteroid for a wide range of inflammatory and autoimmune conditions.',
    sideEffects: 'Posterior subcapsular cataracts, increased intraocular pressure (steroid-induced glaucoma), central serous chorioretinopathy.',
  },
  {
    name: 'Cetirizine',
    uses: 'Antihistamine for allergic rhinitis (hay fever) and urticaria (hives).',
    sideEffects: 'Dry eyes, blurred vision. Can cause pupil dilation (mydriasis), use with caution in patients at risk for angle-closure glaucoma.',
  },
  {
    name: 'Isotretinoin (Roaccutane)',
    uses: 'Severe acne.',
    sideEffects: 'Severe dry eye, blepharitis, conjunctivitis, decreased night vision, and corneal opacities. Intracranial hypertension (pseudotumor cerebri) can cause papilledema.',
  },
  {
    name: 'Hydroxychloroquine',
    uses: 'Rheumatoid arthritis, lupus, and malaria.',
    sideEffects: 'Classic "bull\'s-eye" maculopathy, a potentially irreversible retinal toxicity. Requires regular ophthalmic screening.',
  },
  {
    name: 'Amiodarone',
    uses: 'Cardiac arrhythmias.',
    sideEffects: 'Corneal microdeposits (vortex keratopathy) are very common but usually asymptomatic. Optic neuropathy is a rare but serious side effect.',
  },
  {
    name: 'Tamsulosin',
    uses: 'Benign prostatic hyperplasia (BPH).',
    sideEffects: 'Intraoperative Floppy Iris Syndrome (IFIS), which can complicate cataract surgery. Surgeons must be informed if a patient is taking this drug.',
  },
  {
    name: 'Sildenafil (Viagra)',
    uses: 'Erectile dysfunction.',
    sideEffects: 'Blue-tinged vision (cyanopsia), light sensitivity, blurred vision. Non-arteritic anterior ischemic optic neuropathy (NAION) is a rare but serious risk.',
  },
  {
    name: 'Topiramate',
    uses: 'Epilepsy and migraine prevention.',
    sideEffects: 'Acute angle-closure glaucoma, myopic shift, and visual field defects. These are idiosyncratic reactions that can occur shortly after starting the drug.',
  },
  {
    name: 'Ethambutol',
    uses: 'Tuberculosis.',
    sideEffects: 'Dose-related optic neuropathy, which can cause decreased visual acuity and colour vision defects (especially red-green). Requires baseline and regular monitoring.',
  },
  {
    name: 'Tamoxifen',
    uses: 'Treatment and prevention of breast cancer.',
    sideEffects: 'Crystalline retinopathy, macular edema, and corneal changes. Optic neuritis is a rare complication.',
  },
  {
    name: 'Digoxin',
    uses: 'Heart failure and atrial fibrillation.',
    sideEffects: 'Yellow-green tinted vision (xanthopsia), blurred vision, and "halos" around lights, which can be signs of toxicity.',
  },
  {
    name: 'Indomethacin',
    uses: 'NSAID for pain and inflammation, particularly in arthritis and gout.',
    sideEffects: 'Corneal deposits (keratopathy) and macular disturbances with long-term use.',
  },
  {
    name: 'Bisphosphonates (e.g., Alendronate)',
    uses: 'Osteoporosis.',
    sideEffects: 'Can cause inflammatory eye conditions such as conjunctivitis, uveitis, scleritis, and episcleritis.',
  },
  {
    name: 'Scopolamine (Hyoscine)',
    uses: 'Motion sickness and postoperative nausea.',
    sideEffects: 'Significant mydriasis (pupil dilation) and cycloplegia (loss of accommodation), leading to blurred vision and photophobia. Can trigger angle-closure glaucoma.',
  },
  {
    name: 'Gabapentin',
    uses: 'Epilepsy, neuropathic pain, and restless leg syndrome.',
    sideEffects: 'Nystagmus (involuntary eye movements), diplopia (double vision), and blurred vision are commonly reported.',
  },
  {
    name: 'Citalopram',
    uses: 'Antidepressant (SSRI) for depression and panic disorder.',
    sideEffects: 'Similar to other SSRIs: blurred vision, dry eye, and risk of mydriasis which can precipitate angle-closure glaucoma.',
  },
  {
    name: 'Sertraline',
    uses: 'Antidepressant (SSRI) for depression, OCD, PTSD, and social anxiety disorder.',
    sideEffects: 'Risk of mydriasis (can trigger angle-closure), blurred vision, and dry eye syndrome.',
  },
  {
    name: 'Amitriptyline',
    uses: 'Tricyclic antidepressant for depression and neuropathic pain.',
    sideEffects: 'Strong anticholinergic effects causing blurred vision due to cycloplegia, mydriasis (risk of angle-closure glaucoma), and severe dry eye.',
  },
  {
    name: 'Vigabatrin',
    uses: 'Epilepsy, especially infantile spasms.',
    sideEffects: 'Causes permanent, bilateral concentric visual field loss in a significant percentage of patients. Regular perimetry is mandatory.',
  },
  {
    name: 'Chlorpromazine',
    uses: 'Antipsychotic for schizophrenia and other psychotic disorders.',
    sideEffects: 'Pigmentary changes in the cornea, lens (anterior subcapsular cataracts), and retina with long-term, high-dose use.',
  },
];
