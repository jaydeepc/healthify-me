const fs = require('fs');
const path = require('path');

describe('User Example Model', () => {
  let userModelContent;

  beforeAll(() => {
    // Read the User.example.js file content
    const userModelPath = path.join(__dirname, '../models/User.example.js');
    userModelContent = fs.readFileSync(userModelPath, 'utf8');
  });

  describe('File Structure', () => {
    it('should exist and be readable', () => {
      expect(userModelContent).toBeDefined();
      expect(userModelContent.length).toBeGreaterThan(0);
    });

    it('should contain proper documentation', () => {
      expect(userModelContent).toContain('Example User model');
      expect(userModelContent).toContain('This is a template for creating MongoDB/Mongoose models');
      expect(userModelContent).toContain('Uncomment and modify as needed');
    });

    it('should be properly commented out', () => {
      const lines = userModelContent.split('\n');
      const codeLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('/**') && 
        !line.trim().startsWith('*') && 
        !line.trim().startsWith('*/')
      );
      
      // All non-documentation lines should be commented
      const uncommentedCodeLines = codeLines.filter(line => 
        !line.trim().startsWith('//')
      );
      
      expect(uncommentedCodeLines.length).toBe(0);
    });
  });

  describe('Schema Definition Template', () => {
    it('should include user schema fields', () => {
      expect(userModelContent).toContain('name:');
      expect(userModelContent).toContain('email:');
      expect(userModelContent).toContain('password:');
      expect(userModelContent).toContain('role:');
      expect(userModelContent).toContain('createdAt:');
    });

    it('should include field validation', () => {
      expect(userModelContent).toContain('required:');
      expect(userModelContent).toContain('unique: true');
      expect(userModelContent).toContain('minlength:');
      expect(userModelContent).toContain('match:');
      expect(userModelContent).toContain('enum:');
    });

    it('should include email validation regex', () => {
      expect(userModelContent).toContain('/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/');
      expect(userModelContent).toContain('Please enter a valid email');
    });

    it('should include password security features', () => {
      expect(userModelContent).toContain('select: false');
      expect(userModelContent).toContain('Password must be at least 6 characters');
    });

    it('should include role-based access control', () => {
      expect(userModelContent).toContain("enum: ['user', 'admin']");
      expect(userModelContent).toContain("default: 'user'");
    });
  });

  describe('Middleware and Methods', () => {
    it('should include password hashing middleware', () => {
      expect(userModelContent).toContain('UserSchema.pre(\'save\'');
      expect(userModelContent).toContain('bcrypt.genSalt');
      expect(userModelContent).toContain('bcrypt.hash');
      expect(userModelContent).toContain('isModified(\'password\')');
    });

    it('should include password comparison method', () => {
      expect(userModelContent).toContain('UserSchema.methods.matchPassword');
      expect(userModelContent).toContain('bcrypt.compare');
    });

    it('should include timestamps option', () => {
      expect(userModelContent).toContain('timestamps: true');
    });
  });

  describe('Dependencies', () => {
    it('should reference required packages', () => {
      expect(userModelContent).toContain('mongoose');
      expect(userModelContent).toContain('bcryptjs');
    });

    it('should include proper module export', () => {
      expect(userModelContent).toContain('module.exports');
      expect(userModelContent).toContain('mongoose.model');
    });
  });

  describe('Security Best Practices', () => {
    it('should implement password hashing', () => {
      expect(userModelContent).toContain('bcrypt.genSalt(10)');
      expect(userModelContent).toContain('bcrypt.hash');
    });

    it('should exclude password from queries by default', () => {
      expect(userModelContent).toContain('select: false');
    });

    it('should validate email format', () => {
      expect(userModelContent).toContain('match:');
      expect(userModelContent).toContain('Please enter a valid email');
    });

    it('should enforce minimum password length', () => {
      expect(userModelContent).toContain('minlength: [6');
    });
  });

  describe('Data Validation', () => {
    it('should require essential fields', () => {
      expect(userModelContent).toContain('Name is required');
      expect(userModelContent).toContain('Email is required');
      expect(userModelContent).toContain('Password is required');
    });

    it('should include data sanitization', () => {
      expect(userModelContent).toContain('trim: true');
      expect(userModelContent).toContain('lowercase: true');
    });

    it('should include default values', () => {
      expect(userModelContent).toContain('default: Date.now');
      expect(userModelContent).toContain("default: 'user'");
    });
  });

  describe('Template Usability', () => {
    it('should be easy to uncomment and use', () => {
      // Check that the structure is consistent for easy uncommenting
      const lines = userModelContent.split('\n');
      const commentedLines = lines.filter(line => line.trim().startsWith('//'));
      
      // Should have a significant number of commented lines
      expect(commentedLines.length).toBeGreaterThan(20);
    });

    it('should include helpful comments', () => {
      expect(userModelContent).toContain('Encrypt password using bcrypt');
      expect(userModelContent).toContain('Method to check if entered password matches');
      expect(userModelContent).toContain("Don't include password in query results by default");
    });

    it('should provide complete implementation template', () => {
      expect(userModelContent).toContain('new mongoose.Schema');
      expect(userModelContent).toContain('UserSchema.pre');
      expect(userModelContent).toContain('UserSchema.methods');
      expect(userModelContent).toContain('mongoose.model');
    });
  });

  describe('Code Quality', () => {
    it('should follow consistent formatting', () => {
      // Check for consistent indentation and structure
      const lines = userModelContent.split('\n');
      const codeLines = lines.filter(line => line.trim().startsWith('//'));
      
      // Should have consistent comment prefix
      const inconsistentLines = codeLines.filter(line => 
        !line.startsWith('// ') && line.trim() !== '//'
      );
      
      expect(inconsistentLines.length).toBe(0);
    });

    it('should include proper error handling', () => {
      expect(userModelContent).toContain('if (!this.isModified(\'password\'))');
      expect(userModelContent).toContain('next()');
    });

    it('should use async/await properly', () => {
      expect(userModelContent).toContain('async function');
      expect(userModelContent).toContain('await bcrypt');
    });
  });
});
