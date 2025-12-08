// Types for lookup data
export interface LookupItem {
  id: string;
  name?: string;
  display?: string;
  originId?: string;
  ethnicityId?: string;
  countryId?: string;
  stateProvinceId?: string;
  sectId?: string;
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
