

interface beforeMainCategoryDB {
  name: string;
}

interface beforeMainChallengeDB {
  title: string;
  category: {
    name: string;
    emogi: string;
  };
}

export interface beforeMainResponseDto {
  categoryDB: beforeMainCategoryDB[];
  challengesDB: beforeMainChallengeDB[];
}

export interface categorySearchRequestDto {
  categorySearch: string
}


interface challengeSearchDto {
  category: string;
  title: string;
}


export interface challengeSearchResponseDto {
  code: number;
  message: string;
  challenges?: challengeSearchDto[];
}


interface afterMainCategory {
  name: string;
};

interface afterMainChallenges {
  title: string;
  category: {
    name: string;
    emogi: string;
  };

};

interface afterMainUser {
  nickname: string;
  coopon: number;
};

interface afterMainUserChallengeCount {
  challenges: {
    title: string;
  };
  user_challenge_templetes: {
    title: string | null;
  }[];
};

export interface afterMainResponseDto {
  categoryDB : afterMainCategory[];
  challengesDB : afterMainChallenges[];
  userDB : afterMainUser[];
  userChallengeCountDB : afterMainUserChallengeCount[]
}




