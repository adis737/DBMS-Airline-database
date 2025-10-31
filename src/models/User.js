const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true, lowercase: true },
		passwordHash: { type: String, required: true },
		roles: [{ type: String, enum: ['ADMIN', 'STAFF', 'USER'], default: 'USER' }],
		staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
		active: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password) {
	return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
