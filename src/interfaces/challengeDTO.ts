import exp from "constants";

interface beforeMainCategory {
  name: string;
}

interface beforeMainChallenge {
  title: string;
  category: {
    name: string;
    emogi: string;
  };
}

export interface beforeMainDTO {
  categoryDB: beforeMainCategory[];
  challengesDB: beforeMainChallenge[];
}

export interface categorySearchRequestDTO {
  categorySearch: string
}


export interface challengeSearchDTO {
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

