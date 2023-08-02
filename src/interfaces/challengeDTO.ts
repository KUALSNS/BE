import exp from "constants";

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

export interface beforeMainDto {
  categoryDB: beforeMainCategoryDB[];
  challengesDB: beforeMainChallengeDB[];
}

export interface categorySearchRequestDto {
  categorySearch: string
}


export interface challengeSearchDto {
  title: string;
  category: {
    name: string;
  };
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

export interface afterMainDTO {
  categoryDB : afterMainCategory[];
  challengesDB : afterMainChallenges[];
  userDB : afterMainUser[];
  userChallengeCountDB : afterMainUserChallengeCount[]
}

