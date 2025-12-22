// Types for lookup data
export interface LookupItem {
  id: string;
  name?: string;
  display?: string;
  nameNative?: string;
  originId?: string;
  ethnicityId?: string;
  countryId?: string;
  stateProvinceId?: string;
  sectId?: string;
  isOther?: boolean; // For "Other" options that require text input
  // Origin terminology fields (for flexible labels)
  level1Label?: string;
  level1LabelPlural?: string;
  level2Label?: string;
  level2LabelPlural?: string;
  level2Enabled?: boolean;
}

export interface FormData {
  // Step 1: Basic Info
  profileFor: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  numberOfChildren: number;
  childrenLivingWith: string;
  // Step 2: Origin & Background
  originId: string;
  ethnicityId: string;
  casteId: string;
  customCaste: string;
  // Step 3: Location
  countryOfOriginId: string;
  countryLivingInId: string;
  stateProvinceId: string;
  cityId: string;
  visaStatus: string;
  suggestedLocation: string; // If user can't find their state/city
  // Step 4: Religion & Family
  sectId: string;
  maslakId: string;
  religiousBelonging: string;
  socialStatus: string;
  numberOfBrothers: number;
  numberOfSisters: number;
  marriedBrothers: number;
  marriedSisters: number;
  fatherOccupation: string;
  propertyOwnership: string;
  // Step 5: Physical Attributes
  heightId: string;
  complexion: string;
  hasDisability: boolean;
  disabilityDetails: string;
  // Step 6: Education & Career
  educationLevelId: string;
  educationFieldId: string;
  educationDetails: string;
  occupationType: string;
  occupationDetails: string;
  incomeRangeId: string;
  motherTongueId: string;
  otherMotherTongue: string; // For "Other" option - user's custom entry
  // Step 7: Bio & Visibility
  bio: string;
  originAudience: string; // SAME_ORIGIN or ALL_ORIGINS
}

export const initialFormData: FormData = {
  profileFor: "",
  gender: "",
  dateOfBirth: "",
  maritalStatus: "NEVER_MARRIED",
  numberOfChildren: 0,
  childrenLivingWith: "",
  originId: "",
  ethnicityId: "",
  casteId: "",
  customCaste: "",
  countryOfOriginId: "",
  countryLivingInId: "",
  stateProvinceId: "",
  cityId: "",
  visaStatus: "",
  suggestedLocation: "",
  sectId: "",
  maslakId: "",
  religiousBelonging: "",
  socialStatus: "",
  numberOfBrothers: 0,
  numberOfSisters: 0,
  marriedBrothers: 0,
  marriedSisters: 0,
  fatherOccupation: "",
  propertyOwnership: "",
  heightId: "",
  complexion: "",
  hasDisability: false,
  disabilityDetails: "",
  educationLevelId: "",
  educationFieldId: "",
  educationDetails: "",
  occupationType: "",
  occupationDetails: "",
  incomeRangeId: "",
  motherTongueId: "",
  otherMotherTongue: "",
  bio: "",
  originAudience: "SAME_ORIGIN",
};

// Step titles for the progress indicator
export const STEP_TITLES = [
  "Basic Info",
  "Origin & Background",
  "Location",
  "Religion & Family",
  "Physical Attributes",
  "Education & Career",
  "About Me",
];

export const TOTAL_STEPS = 7;
