const getCompetitionPhase = (competition, now = new Date()) => {
  if (competition.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (now < competition.dates.registrationDeadline) {
    return "REGISTRATION_OPEN";
  }

  if (
    now >= competition.dates.registrationDeadline &&
    now < competition.dates.submissionStart
  ) {
    return "REGISTRATION_CLOSED";
  }

  if (
    now >= competition.dates.submissionStart &&
    now <= competition.dates.submissionDeadline
  ) {
    return "SUBMISSION_OPEN";
  }

  if (
    now > competition.dates.submissionDeadline &&
    now < competition.dates.resultDate
  ) {
    return "JUDGING";
  }

  return "COMPLETED";
};

module.exports = {
  getCompetitionPhase,
};