export const checkApproval = (req, res, next) => {
    if (req.user.status !== 'approved') {
        return res.status(403).json({ message: 'Your account is not approved yet. Please wait for admin approval.' });
    }
    next();
};
