function stripNonNumeric(x) {
  x = x !== undefined ? x.toString() : "";
  var n = parseFloat(
    (x.charAt(0) == "-" ? "-" : "") + x.replace(/[^0-9]+/g, "")
  );
  return isNaN(n) ? 0 : n;
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function generateEPCAdvice(
  lumpSum,
  projectedLumpSum,
  desiredAmt,
  projectedMonthlyPayment,
  monthlyShortfall,
  inLumpSumMode
) {
  lumpSum = stripNonNumeric(lumpSum);
  projectedLumpSum = stripNonNumeric(projectedLumpSum);
  desiredAmt = stripNonNumeric(desiredAmt);
  projectedMonthlyPayment = stripNonNumeric(projectedMonthlyPayment);
  monthlyShortfall = stripNonNumeric(monthlyShortfall);

  var adviceSummary;
  if (inLumpSumMode) {
    if (projectedRSABalance < 550000) {
      adviceSummary =
        "<p>The total amount of your Pension would be paid to you en bloc as it is less than <b>&#8358;550,000.00</b></p>";
    } else {
      adviceSummary =
        "<p>You would be eligible for an estimated lump sum of <b>&#8358;" +
        numberWithCommas(projectedLumpSum.toFixed(0)) +
        "</b> " +
        "and a monthly pension of <b>&#8358;" +
        numberWithCommas(projectedMonthlyPayment.toFixed(0)) +
        "</b>.</p>";
    }
  } else {
    if (projectedRSABalance < 550000) {
      adviceSummary =
        "<p>The total amount of your Pension would be paid to you en bloc as it is less than <b>&#8358;550,000.00</b></p>";
    } else {
      adviceSummary =
        "<p>You would be eligible for an estimated monthly pension of <b>&#8358;" +
        numberWithCommas(projectedMonthlyPayment.toFixed(0)) +
        "</b></p>";
    }
  }
  if (monthlyShortfall.toFixed(0) > 0) {
    if (inLumpSumMode) {
      adviceSummary +=
        "<p>To attain your desired lump sum of <b>&#8358;" +
        numberWithCommas(lumpSum.toFixed(0)) +
        "</b>, you would need to make additional monthly Voluntary Contributions of <i>&#8358;" +
        numberWithCommas(monthlyShortfall.toFixed(0)) +
        "</i> from now until retirement.</p>";
    } else {
      adviceSummary +=
        "<p>To attain your monthly payment of <b>&#8358;" +
        numberWithCommas(desiredAmt.toFixed(0)) +
        "</b>, you would need to make additional monthly Voluntary Contributions of <i>&#8358;" +
        numberWithCommas(monthlyShortfall.toFixed(0)) +
        "</i> from now until retirement.</p>";
    }
  } else {
    adviceSummary +=
      "<p>Well done! You are in the right direction in attaining your financial goals! " +
      "You may explore other investment opportunities if you wish to exceed your goals.</p>";
  }
  return adviceSummary;
}
function generateBPAdvice(leftOverCash, savingsTotal, retirementSavings) {
  leftOverCash = stripNonNumeric(leftOverCash);
  savingsTotal = stripNonNumeric(savingsTotal);

  var adviceSummary;
  if (leftOverCash < 0) {
    if (savingsTotal == 0) {
      adviceSummary =
        "<p>Your budget is at a deficit. We suggest you review your expenses and set aside " +
        "savings to shelter you for the rainy day.</p>";
    } else {
      adviceSummary =
        "<p>Your budget is at a deficit. " +
        "We suggest that you review your expenses to prevent financial strain " +
        "whilst you continue to put money aside for your savings.</p>";
    }
  } else if (leftOverCash == 0) {
    if (savingsTotal != 0) {
      adviceSummary =
        "<p>Well done on maximizing your budget! Review your savings and ensure your " +
        "retirement plans are being met by using the Pension Calculator.</p>";
    } else {
      adviceSummary =
        "<p>You have fully utilized your income with no consideration " +
        "for savings. We suggest you review your expenses and set aside money for the rainy day.</p>";
    }
  } else if (leftOverCash > 0) {
    if (savingsTotal != 0) {
      adviceSummary =
        "<p>You still have a surplus amount of <b>" +
        "&#8358;" +
        numberWithCommas(leftOverCash.toFixed(0)) +
        "</b>. " +
        "Why not boost your retirement savings today through " +
        (retirementSavings > 0 ? "additional " : "") +
        "Voluntary Contributions? Our Pension Calculator can estimate the future value of your RSA balance.</p>";
    } else {
      adviceSummary =
        "<p>You have a surplus amount of <b>&#8358;" +
        numberWithCommas(leftOverCash.toFixed(0)) +
        "</b>. Why not set aside savings for the rainy day?</p>";
    }
  }
  return adviceSummary;
}
module.exports = {
  stripNonNumeric,
  numberWithCommas,
  generateEPCAdvice,
  generateBPAdvice,
};
