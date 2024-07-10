const query = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      username
      githubUrl
      twitterUrl
      linkedinUrl
      contributions {
        points
        questionCount
        testcaseCount
      }
      profile {
        reputation
        ranking
        badges {
          name
          icon
        }
        upcomingBadges {
          name
          icon
        }
        activeBadge {
          id
          displayName
          icon
          creationDate
        }
        realName
        userAvatar
        birthday
        websites
        countryName
        company
        school
        skillTags
        aboutMe
        starRating
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      submissionCalendar
    }
    recentSubmissionList(username: $username, limit: 20) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
    matchedUserStats: matchedUser(username: $username) {
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
          __typename
        }
        __typename
      }
    }
  }
`;


// format data 
const formatData = (data) => {
    const allQuestions = data.allQuestionsCount;
    const acSubmissionNum = data.matchedUser.submitStats.acSubmissionNum;
    
    let sendData = {
        totalSolved: acSubmissionNum.reduce((acc, cur) => acc + cur.count, 0),
        totalSubmissions: data.matchedUser.submitStats.totalSubmissionNum,
        totalQuestions: allQuestions.reduce((acc, cur) => acc + cur.count, 0),
        easySolved: acSubmissionNum.find(stat => stat.difficulty === 'easy')?.count || 0,
        totalEasy: allQuestions.find(q => q.difficulty === 'easy')?.count || 0,
        mediumSolved: acSubmissionNum.find(stat => stat.difficulty === 'medium')?.count || 0,
        totalMedium: allQuestions.find(q => q.difficulty === 'medium')?.count || 0,
        hardSolved: acSubmissionNum.find(stat => stat.difficulty === 'hard')?.count || 0,
        totalHard: allQuestions.find(q => q.difficulty === 'hard')?.count || 0,
        ranking: data.matchedUser.profile.ranking,
        contributionPoint: data.matchedUser.contributions.points,
        reputation: data.matchedUser.profile.reputation,
        submissionCalendar: JSON.parse(data.matchedUser.submissionCalendar || '{}'),
        recentSubmissions: data.recentSubmissionList,
        badges: data.matchedUser.profile.badges || []
    };
    return sendData;
}


//fetching the data
exports.leetcode = (req, res) => {
    let user = req.params.id;
    fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com'
        }, 
        body: JSON.stringify({query: query, variables: {username: user}}),
    
    })
    .then(result => result.json())
    .then(data => {
      if(data.errors){
        res.send(data);
      }else {
        res.send(formatData(data.data));
      }
    })
    .catch(err=>{
        console.error('Error', err);
        res.send(err);
    });
}
