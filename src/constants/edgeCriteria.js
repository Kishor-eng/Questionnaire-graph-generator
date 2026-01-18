// Edge Trigger Criteria Types
export const EDGE_CRITERIA_TYPES = {
  // Age Criteria
  AGE_GTE: 'age_gte',
  AGE_LT: 'age_lt',

  // Gender Criteria  
  GENDER_FEMALE: 'gender_female',
  GENDER_NOT_FEMALE: 'gender_not_female',

  // Boolean Criteria
  BOOL_YES: 'bool_yes',
  BOOL_NO: 'bool_no',

  // List Criteria
  LIST_VALUE_SET: 'list_value_set',
  LIST_VALUE_NOT_SET: 'list_value_not_set',
  ANY_LIST_VALUE_SET: 'any_list_value_set',
  NO_LIST_VALUE_SET: 'no_list_value_set',

  // BMI Criteria
  BMI_GTE: 'bmi_gte',
  BMI_LT: 'bmi_lt',

  // Ethnicity Criteria
  ETHNICITY_SET: 'ethnicity_set',
  ETHNICITY_NOT_SET: 'ethnicity_not_set',

  // Medication Criteria
  RECENT_MEDICATION_USAGE_INDICATED: 'recent_medication_usage_indicated',
  RECENT_MEDICATION_USAGE_NOT_INDICATED: 'recent_medication_usage_not_indicated',

  // Authentication Criteria
  AUTHENTICATED: 'Authenticated',
  UNAUTHENTICATED: 'Unauthenticated',

  // Cold Chain Criteria
  COLD_CHAIN_SERVICEABLE_TRUE: 'Cold Chain Serviceable True',
  COLD_CHAIN_SERVICEABLE_FALSE: 'Cold Chain Serviceable False',

  // Time Criteria
  TIME_PASSED_GTE: 'Time passed greater than or equal',
  TIME_PASSED_LT: 'Time passed less than'
};

// Edge Criteria Labels
export const EDGE_CRITERIA_LABELS = {
  [EDGE_CRITERIA_TYPES.AGE_GTE]: "Age greater than or equal",
  [EDGE_CRITERIA_TYPES.AGE_LT]: "Age less than",
  [EDGE_CRITERIA_TYPES.GENDER_FEMALE]: "Gender is female",
  [EDGE_CRITERIA_TYPES.GENDER_NOT_FEMALE]: "Gender is not female",
  [EDGE_CRITERIA_TYPES.BOOL_YES]: "Boolean yes",
  [EDGE_CRITERIA_TYPES.BOOL_NO]: "Boolean no",
  [EDGE_CRITERIA_TYPES.LIST_VALUE_SET]: "List value set",
  [EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET]: "List value not set",
  [EDGE_CRITERIA_TYPES.ANY_LIST_VALUE_SET]: "Any list value set",
  [EDGE_CRITERIA_TYPES.NO_LIST_VALUE_SET]: "No list value set",
  [EDGE_CRITERIA_TYPES.BMI_GTE]: "BMI greater than or equal",
  [EDGE_CRITERIA_TYPES.BMI_LT]: "BMI less than",
  [EDGE_CRITERIA_TYPES.ETHNICITY_SET]: "Ethnicity set",
  [EDGE_CRITERIA_TYPES.ETHNICITY_NOT_SET]: "Ethnicity not set",
  [EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_INDICATED]: "Recent medication usage indicated",
  [EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_NOT_INDICATED]: "Recent medication usage not indicated",
  [EDGE_CRITERIA_TYPES.AUTHENTICATED]: 'Authenticated',
  [EDGE_CRITERIA_TYPES.UNAUTHENTICATED]: 'Unauthenticated',
  [EDGE_CRITERIA_TYPES.COLD_CHAIN_SERVICEABLE_TRUE]: 'Cold Chain Serviceable True',
  [EDGE_CRITERIA_TYPES.COLD_CHAIN_SERVICEABLE_FALSE]: 'Cold Chain Serviceable False',
  [EDGE_CRITERIA_TYPES.TIME_PASSED_GTE]: 'Time passed greater than or equal',
  [EDGE_CRITERIA_TYPES.TIME_PASSED_LT]: 'Time passed less than'
};

// Question Tags yang mempengaruhi kriteria yang tersedia
export const QUESTION_TAGS = {
  ADDRESS: 'address',
  ALLERGIES: 'allergies',
  DEMOGRAPHIC_DOB: 'demographic_dob',
  DEMOGRAPHIC_GENDER: 'demographic_gender',
  ETHNICITY: 'ethnicity',
  OBSERVATION_HEIGHT: 'observation_height',
  OBSERVATION_WEIGHT: 'observation_weight',
  RECENTLY_ON_MEDICATION: 'recently_on_medication'
  // ... tambahkan tag lain yang relevan dengan edge criteria
};

// Mapping tipe pertanyaan ke kriteria yang tersedia
export const QUESTION_TYPE_CRITERIA_MAP = {
  'number': [
    EDGE_CRITERIA_TYPES.AGE_GTE,
    EDGE_CRITERIA_TYPES.AGE_LT
  ],
  'float': [
    EDGE_CRITERIA_TYPES.AGE_GTE,
    EDGE_CRITERIA_TYPES.AGE_LT
  ],
  'single_selection_list': [
    EDGE_CRITERIA_TYPES.LIST_VALUE_SET,
    EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET,
    EDGE_CRITERIA_TYPES.ANY_LIST_VALUE_SET,
    EDGE_CRITERIA_TYPES.NO_LIST_VALUE_SET
  ],
  'multi_selection_list': [
    EDGE_CRITERIA_TYPES.LIST_VALUE_SET,
    EDGE_CRITERIA_TYPES.LIST_VALUE_NOT_SET,
    EDGE_CRITERIA_TYPES.ANY_LIST_VALUE_SET,
    EDGE_CRITERIA_TYPES.NO_LIST_VALUE_SET
  ]
};

// Mapping tag pertanyaan ke kriteria tambahan
export const QUESTION_TAG_CRITERIA_MAP = {
  [QUESTION_TAGS.DEMOGRAPHIC_GENDER]: [
    EDGE_CRITERIA_TYPES.GENDER_FEMALE,
    EDGE_CRITERIA_TYPES.GENDER_NOT_FEMALE
  ],
  [QUESTION_TAGS.DEMOGRAPHIC_DOB]: [
    EDGE_CRITERIA_TYPES.AGE_GTE,
    EDGE_CRITERIA_TYPES.AGE_LT,
    EDGE_CRITERIA_TYPES.TIME_PASSED_GTE,
    EDGE_CRITERIA_TYPES.TIME_PASSED_LT
  ],
  [QUESTION_TAGS.OBSERVATION_HEIGHT]: [
    EDGE_CRITERIA_TYPES.BMI_GTE,
    EDGE_CRITERIA_TYPES.BMI_LT
  ],
  [QUESTION_TAGS.OBSERVATION_WEIGHT]: [
    EDGE_CRITERIA_TYPES.BMI_GTE,
    EDGE_CRITERIA_TYPES.BMI_LT
  ],
  [QUESTION_TAGS.ETHNICITY]: [
    EDGE_CRITERIA_TYPES.ETHNICITY_SET,
    EDGE_CRITERIA_TYPES.ETHNICITY_NOT_SET
  ],
  [QUESTION_TAGS.RECENTLY_ON_MEDICATION]: [
    EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_INDICATED,
    EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_NOT_INDICATED
  ],
  [QUESTION_TAGS.ADDRESS]: [
    EDGE_CRITERIA_TYPES.COLD_CHAIN_SERVICEABLE_TRUE,
    EDGE_CRITERIA_TYPES.COLD_CHAIN_SERVICEABLE_FALSE
  ]
};

// Mapping tag to available criteria
export const TAG_CRITERIA_MAP = {
  demographic_dob: [EDGE_CRITERIA_TYPES.AGE_GTE, EDGE_CRITERIA_TYPES.AGE_LT],
  demographic_gender: [EDGE_CRITERIA_TYPES.GENDER_FEMALE, EDGE_CRITERIA_TYPES.GENDER_NOT_FEMALE],
  observation_height: [EDGE_CRITERIA_TYPES.BMI_GTE, EDGE_CRITERIA_TYPES.BMI_LT],
  observation_weight: [EDGE_CRITERIA_TYPES.BMI_GTE, EDGE_CRITERIA_TYPES.BMI_LT],
  ethnicity: [EDGE_CRITERIA_TYPES.ETHNICITY_SET, EDGE_CRITERIA_TYPES.ETHNICITY_NOT_SET],
  recently_on_medication: [
    EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_INDICATED,
    EDGE_CRITERIA_TYPES.RECENT_MEDICATION_USAGE_NOT_INDICATED
  ]
};

// Helper function untuk mendapatkan kriteria berdasarkan tipe dan tag pertanyaan
export const getCriteriaForQuestion = (questionType, questionTag) => {
  let availableCriteria = [];

  // Tambahkan kriteria berdasarkan tipe
  if (QUESTION_TYPE_CRITERIA_MAP[questionType]) {
    availableCriteria = [...availableCriteria, ...QUESTION_TYPE_CRITERIA_MAP[questionType]];
  }

  // Tambahkan kriteria berdasarkan tag
  if (questionTag && QUESTION_TAG_CRITERIA_MAP[questionTag]) {
    availableCriteria = [...availableCriteria, ...QUESTION_TAG_CRITERIA_MAP[questionTag]];
  }

  // Selalu sertakan kriteria boolean
  availableCriteria = [...availableCriteria, EDGE_CRITERIA_TYPES.BOOL_YES, EDGE_CRITERIA_TYPES.BOOL_NO];

  // Hapus duplikat jika ada
  return [...new Set(availableCriteria)];
};

// Helper function untuk mendapatkan kriteria berdasarkan tag
export const getCriteriaForQuestionTags = (tags = []) => {
  if (!tags || tags.length === 0) return [];

  const availableCriteria = new Set();
  
  tags.forEach(tag => {
    const tagCriteria = TAG_CRITERIA_MAP[tag];
    if (tagCriteria) {
      tagCriteria.forEach(criteria => availableCriteria.add(criteria));
    }
  });

  return Array.from(availableCriteria).map(criteria => ({
    value: criteria,
    label: EDGE_CRITERIA_LABELS[criteria]
  }));
};

// Format kriteria untuk dropdown
export const formatCriteriaForDropdown = (criteria) => {
  return criteria.map(criteriaType => ({
    value: criteriaType,
    label: EDGE_CRITERIA_LABELS[criteriaType]
  }));
}; 