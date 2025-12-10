// rules: { logic: "AND" | "OR", conditions: [{ questionKey, operator, value }] }
// answersSoFar: { [questionKey]: any }

export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  const { logic, conditions } = rules;

  const evalCondition = (cond) => {
    if (!cond || !cond.questionKey || !cond.operator) return true;

    const answer = answersSoFar[cond.questionKey];
    const target = cond.value;

    switch (cond.operator) {
      case "equals":
        return answer === target;
      case "notEquals":
        return answer !== target;
      case "contains":
        if (Array.isArray(answer)) {
          return answer.includes(target);
        }
        if (typeof answer === "string") {
          return answer?.toLowerCase().includes(String(target).toLowerCase());
        }
        return false;
      default:
        return true; // unknown operator = don't block
    }
  };

  const results = conditions.map(evalCondition);

  if (logic === "OR") {
    return results.some(Boolean);
  }
  // default AND
  return results.every(Boolean);
}
