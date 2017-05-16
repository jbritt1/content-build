const mock = require('./mock-helpers');
const selectDropdown = require('./e2e-helpers.js').selectDropdown;

// Create API routes
function initApplicationSubmitMock(form) {
  mock(null, {
    path: `/v0/education_benefits_claims/${form}`,
    verb: 'post',
    value: {
      data: {
        attributes: {
          confirmationNumber: '123fake-submission-id-567',
          submittedAt: '2016-05-16',
          regionalOffice: 'Test'
        }
      }
    }
  });
}

function completeVeteranInformation(client, data, root = 'root') {
  client
    .fill(`input[name="${root}_veteranFullName_first"]`, data.veteranFullName.first)
    .fill(`input[name="${root}_veteranFullName_last"]`, data.veteranFullName.last);

  if (data['view:veteranId']) {
    client
      .fill(`input[name="${root}_view:veteranId_veteranSocialSecurityNumber"]`, data['view:veteranId'].veteranSocialSecurityNumber)
      .click(`input[name="${root}_view:veteranId_view:noSSN"]`)
      .setValue(`input[name="${root}_view:veteranId_vaFileNumber"]`, data['view:veteranId'].vaFileNumber);
  } else {
    client.fill(`input[name="${root}_veteranSocialSecurityNumber"]`, data.veteranSocialSecurityNumber);
  }

  if (data.relationship === 'spouse') {
    client.selectYesNo('root_spouseInfo_divorcePending', data.spouseInfo.divourcePending);
  }

  if (data.veteranDateOfBirth) {
    client.fillDate('root_veteranDateOfBirth', data.veteranDateOfBirth);
  }

  client
    .setValue(`input[name="${root}_veteranFullName_middle"]`, data.veteranFullName.middle)
    .setValue(`select[name="${root}_veteranFullName_suffix"]`, data.veteranFullName.suffix);
  if (data.relationship === 'spouse') {
    client.selectYesNo('root_spouseInfo_remarried', data.spouseInfo.remarried);
    if (data.spouseInfo.remarried) {
      client.fillDate('root_spouseInfo_remarriageDate', data.spouseInfo.remarriageDate);
    }
  }
  if (data.veteranDateOfDeath) {
    client.fillDate('root_veteranDateOfDeath', data.veteranDateOfDeath);
  }
}

function completeRelativeInformation(client, data) {
  const dobFields = data.relativeDateOfBirth.split('-');
  client
    .clearValue('input[name="root_relativeFullName_first"]')
    .setValue('input[name="root_relativeFullName_first"]', data.relativeFullName.first)
    .clearValue('input[name="root_relativeFullName_last"]')
    .setValue('input[name="root_relativeFullName_last"]', data.relativeFullName.last)
    .clearValue('input[name="root_relativeSocialSecurityNumber"]')
    .setValue('input[name="root_relativeSocialSecurityNumber"]', data.relativeSocialSecurityNumber)
    .clearValue('input[name="root_relativeDateOfBirthYear"]')
    .setValue('input[name="root_relativeDateOfBirthYear"]', parseInt(dobFields[0], 10).toString());
  selectDropdown(client, 'root_relativeDateOfBirthMonth', parseInt(dobFields[1], 10).toString());
  selectDropdown(client, 'root_relativeDateOfBirthDay', parseInt(dobFields[2], 10).toString());

  if (typeof data.relationship !== 'undefined') {
    client
      .click('input[name="root_relationship_0"]');
  }

  client
    .setValue('input[name="root_relativeFullName_middle"]', data.relativeFullName.middle)
    .click(data.gender === 'M' ? 'input[name=root_gender_0' : 'input[name=root_gender_1');
  selectDropdown(client, 'root_relativeFullName_suffix', data.relativeFullName.suffix);

  if (data.relativeVaFileNumber) {
    client
      .click('input[name="root_view:noSSN"]')
      .fill('input[name="root_relativeVaFileNumber"]', data.relativeVaFileNumber);
  } else if (data.vaFileNumber) {
    client
      .click('input[name="root_view:noSSN"]')
      .fill('input[name="root_vaFileNumber"]', data.vaFileNumber);
  }
}

function completeAdditionalBenefits(client, data) {
  if (typeof data.nonVaAssistance !== 'undefined') {
    client.click(data.nonVaAssistance ? 'input[name="root_nonVaAssistanceYes"]' : 'input[name="root_nonVaAssistanceNo"]');
  }
  if (typeof data.civilianBenefitsAssistance !== 'undefined') {
    client.click(data.civilianBenefitsAssistance ? 'input[name="root_civilianBenefitsAssistanceYes"]' : 'input[name="root_civilianBenefitsAssistanceNo"]');

    if (typeof data.civilianBenefitsSource !== 'undefined') {
      client.fill('input[name="root_civilianBenefitsSource"]', data.civilianBenefitsSource);
    }
  }
}

function completeBenefitsSelection(client, data) {
  if (data.benefit) {
    client.click(`input[value="${data.benefit}"]`);
  } else if (typeof data.payHighestRateBenefit !== 'undefined') {
    // Defaults to true, so only click if we need to make it false
    client.clickIf('input[name="root_payHighestRateBenefit"]', !data.payHighestRateBenefit);
  } else {
    client.click('.form-radio-buttons:first-child input');
  }
}

/**
 * Completes the service periods page.
 *
 * @param {Object} client   - The nightwatch client
 * @param {Object} data     - The testing data
 * @param {String} | {Bool} - The name of the yes / no widget or false to skip
 *                            clicking on the yes / no
 */
function completeServicePeriods(client, data, serviceName = 'view:newService') {
  if (serviceName) {
    client
      .click(`input[name="root_${serviceName}Yes"]`);
  }
  client
    .fill('input[name="root_toursOfDuty_0_serviceBranch"]', data.toursOfDuty[0].serviceBranch)
    .fillDate('root_toursOfDuty_0_dateRange_from', data.toursOfDuty[0].dateRange.from)
    .fillDate('root_toursOfDuty_0_dateRange_to', data.toursOfDuty[0].dateRange.to)
    .click('button.va-growable-add-btn')
    .fill('input[name="root_toursOfDuty_1_serviceBranch"]', data.toursOfDuty[1].serviceBranch)
    .fillDate('root_toursOfDuty_1_dateRange_from', data.toursOfDuty[1].dateRange.from)
    .fillDate('root_toursOfDuty_1_dateRange_to', data.toursOfDuty[1].dateRange.to);
}

function completeVeteranAddress(client, data) {
  client
    .clearValue('input[name="root_veteranAddress_street"]')
    .setValue('input[name="root_veteranAddress_street"]', data.veteranAddress.street)
    .clearValue('input[name="root_veteranAddress_street2"]')
    .setValue('input[name="root_veteranAddress_street2"]', data.veteranAddress.street2)
    .clearValue('input[name="root_veteranAddress_city"]')
    .setValue('input[name="root_veteranAddress_city"]', data.veteranAddress.city)
    .clearValue('select[name="root_veteranAddress_state"]')
    .setValue('select[name="root_veteranAddress_state"]', data.veteranAddress.state)
    .clearValue('input[name="root_veteranAddress_postalCode"]')
    .setValue('input[name="root_veteranAddress_postalCode"]', data.veteranAddress.postalCode);
}

function completeRelativeAddress(client, data) {
  client
    .clearValue('input[name="root_relativeAddress_street"]')
    .setValue('input[name="root_relativeAddress_street"]', data.relativeAddress.street)
    .clearValue('input[name="root_relativeAddress_street2"]')
    .setValue('input[name="root_relativeAddress_street2"]', data.relativeAddress.street2)
    .clearValue('input[name="root_relativeAddress_city"]')
    .setValue('input[name="root_relativeAddress_city"]', data.relativeAddress.city)
    .clearValue('select[name="root_relativeAddress_state"]')
    .setValue('select[name="root_relativeAddress_state"]', data.relativeAddress.state)
    .clearValue('input[name="root_relativeAddress_postalCode"]')
    .setValue('input[name="root_relativeAddress_postalCode"]', data.relativeAddress.postalCode);
}

function completeContactInformation(client, data, isRelative = false) {
  if (isRelative) {
    completeRelativeAddress(client, data);
  } else {
    completeVeteranAddress(client, data);
  }
  client
    .clearValue('input[name="root_view:otherContactInfo_email"]')
    .setValue('input[name="root_view:otherContactInfo_email"]', data['view:otherContactInfo'].email)
    .clearValue('input[name="root_view:otherContactInfo_view:confirmEmail"]')
    .setValue('input[name="root_view:otherContactInfo_view:confirmEmail"]', data['view:otherContactInfo']['view:confirmEmail']);

  client
    .click('input[name="root_preferredContactMethod_2"]')
    .clearValue('input[name="root_view:otherContactInfo_homePhone"]')
    .setValue('input[name="root_view:otherContactInfo_homePhone"]', data['view:otherContactInfo'].homePhone)
    .clearValue('input[name="root_view:otherContactInfo_mobilePhone"]')
    .setValue('input[name="root_view:otherContactInfo_mobilePhone"]', data['view:otherContactInfo'].mobilePhone);
}

function completePaymentChange(client) {
  client
    .click('input[name="root_bankAccountChange_1"]');
}

function completeDirectDeposit(client, data) {
  client
    .click('input[name="root_bankAccount_accountType_1"]')
    .setValue('input[name="root_bankAccount_accountNumber"]', data.bankAccount.accountNumber)
    .setValue('input[name="root_bankAccount_routingNumber"]', data.bankAccount.routingNumber);
}

function completeSchoolSelection(client, data) {
  selectDropdown(client, 'root_educationProgram_educationType', data.educationProgram.educationType);

  client
    .fill('input[name="root_educationProgram_name"]', data.educationProgram.name)
    .fill('input[name="root_educationProgram_address_street"]', data.educationProgram.address.street)
    .fill('input[name="root_educationProgram_address_street2"]', data.educationProgram.address.street2)
    .fill('input[name="root_educationProgram_address_city"]', data.educationProgram.address.city)
    .fill('select[name="root_educationProgram_address_state"]', data.educationProgram.address.state)
    .fill('input[name="root_educationProgram_address_postalCode"]', data.educationProgram.address.postalCode)
    .fill('textarea[id="root_educationObjective"]', data.educationObjective);
}

function completeEmploymentHistory(client, data) {
  const nonMilitaryJobs = data.nonMilitaryJobs[0];
  client
    .click('input[name="root_view:hasNonMilitaryJobsYes"]')
    .fill('input[name="root_nonMilitaryJobs_0_name"]', nonMilitaryJobs.name)
    .fill('input[name="root_nonMilitaryJobs_0_months"]', nonMilitaryJobs.months)
    .fill('input[name="root_nonMilitaryJobs_0_licenseOrRating"]', nonMilitaryJobs.licenseOrRating);
}


module.exports = {
  initApplicationSubmitMock,
  completeVeteranInformation,
  completeRelativeInformation,
  completeAdditionalBenefits,
  completeBenefitsSelection,
  completeServicePeriods,
  completeVeteranAddress,
  completeContactInformation,
  completePaymentChange,
  completeDirectDeposit,
  completeSchoolSelection,
  completeEmploymentHistory
};
