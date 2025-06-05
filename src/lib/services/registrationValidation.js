
import UnitRegistration from '@/models/UnitRegistration';
import Semester from '@/models/Semester';
import Unit from '@/models/Unit';
import User from '@/models/User';
import connectDB from '../mongodb';


export class RegistrationValidationService {
  static async validateRegistration(studentId, unitId, semesterId) {
    await connectDB();
    const errors = [];
    
    // 1. Check semester registration period
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      errors.push({
        code: 'SEMESTER_NOT_FOUND',
        message: 'Semester not found'
      });
      return { isValid: false, errors };
    }

    if (!semester.isRegistrationOpen) {
      errors.push({
        code: 'REGISTRATION_CLOSED',
        message: `Registration period is closed. Registration was open from ${semester.registrationStartDate.toLocaleDateString()} to ${semester.registrationEndDate.toLocaleDateString()}`
      });
    }
    
    // 2. Check maximum units limit
    const currentRegistrations = await UnitRegistration.countDocuments({
      student: studentId,
      semester: semesterId,
      status: 'active'
    });
    
    if (currentRegistrations >= semester.maxUnitsPerStudent) {
      errors.push({
        code: 'MAX_UNITS_EXCEEDED',
        message: `Maximum unit limit (${semester.maxUnitsPerStudent}) reached`
      });
    }
    
    // 3. Get unit with enrollment count
    const unit = await Unit.findById(unitId).populate('prerequisites');
    if (!unit) {
      errors.push({
        code: 'UNIT_NOT_FOUND',
        message: 'Unit not found'
      });
      return { isValid: false, errors };
    }

    // 4. Check unit capacity
    if (unit.capacity) {
      const enrolledCount = await UnitRegistration.countDocuments({
        unit: unitId,
        semester: semesterId,
        status: 'active'
      });

      if (enrolledCount >= unit.capacity) {
        errors.push({
          code: 'UNIT_FULL',
          message: `Unit is full (${enrolledCount}/${unit.capacity} enrolled)`
        });
      }
    }
    
    // 5. Check prerequisites
    if (unit.prerequisites && unit.prerequisites.length > 0) {
      const completedUnits = await UnitRegistration.find({
        student: studentId,
        unit: { $in: unit.prerequisites },
        status: 'completed',
        grade: { $gte: 50 } // Assuming 50 is passing grade
      }).populate('unit');
      
      const completedUnitIds = completedUnits.map(reg => reg.unit._id.toString());
      const missingPrereqs = unit.prerequisites.filter(
        prereq => !completedUnitIds.includes(prereq._id.toString())
      );
      
      if (missingPrereqs.length > 0) {
        const missingUnitCodes = missingPrereqs.map(u => u.code).join(', ');
        errors.push({
          code: 'MISSING_PREREQUISITES',
          message: `Missing prerequisites: ${missingUnitCodes}`
        });
      }
    }
    
    // 6. Check if already registered
    const existing = await UnitRegistration.findOne({
      student: studentId,
      unit: unitId,
      semester: semesterId,
      status: { $ne: 'dropped' }
    });
    
    if (existing) {
      errors.push({
        code: 'ALREADY_REGISTERED',
        message: 'Already registered for this unit'
      });
    }
    
    // 7. Check if student is enrolled in the course
    const user = await User.findById(studentId);
    if (!user) {
      errors.push({
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
      return { isValid: false, errors };
    }

    if (!user.course || user.course.toString() !== unit.course.toString()) {
      errors.push({
        code: 'NOT_ENROLLED_IN_COURSE',
        message: 'You must be enrolled in the course to register for this unit'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getErrorMessage(errorCode) {
    const errorMessages = {
      REGISTRATION_CLOSED: 'The registration period has ended. Please contact your academic advisor.',
      MAX_UNITS_EXCEEDED: 'You have reached the maximum number of units allowed for this semester.',
      UNIT_FULL: 'This unit is full. Please select another unit or contact your department.',
      MISSING_PREREQUISITES: 'You must complete the prerequisite units before registering for this unit.',
      ALREADY_REGISTERED: 'You are already registered for this unit.',
      NOT_ENROLLED_IN_COURSE: 'This unit is not available for your course.',
      SEMESTER_NOT_FOUND: 'The selected semester was not found.',
      UNIT_NOT_FOUND: 'The selected unit was not found.',
      USER_NOT_FOUND: 'User information not found.'
    };

    return errorMessages[errorCode] || 'An unknown error occurred.';
  }
}
