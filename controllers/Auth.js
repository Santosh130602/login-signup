const bcrypt = require("bcrypt")
const User = require("../models/User")
const jwt = require("jsonwebtoken");
const { use } = require("bcrypt/promises");
const { options } = require("../routes/user");
require("dotenv").config();



/*  ************************************************************************************************************************************************
                                                                 SignUp handler function
 ************************************************************************************************************************************************ */


exports.SignUp = async (req, res) => {
    try {
        const { email, password,confirmPassword } = req.body;
        // check all entry are filled or not 
        if ( !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all entrys",
            })
        }
        // check user already exist
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already exist",
            })
        }
        // secure password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10)

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Does not hashed password retry",
            })
        }

        // create entry for user
        const user = await User.create({
            email, password: hashedPassword
        })

        return res.status(200).json({
            success: true,
            message: "User registerd successfully",
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User can not be registerd pleas try again later",
        })
    }
}




/*  ************************************************************************************************************************************************
                                                                 Login handler function
 ************************************************************************************************************************************************ */



exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log('Entered Email:', email);
        // console.log('Entered Password:', password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all entries",
            });
        }

        // check user exists or not
        const user = await User.findOne({ email });
        // console.log('User:', user);

        // if user not registered
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered, please register first",
            });
        }

        // check password is correct or not and generate jwt token
        // console.log('Stored Hashed Password:', user.password);
        const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log('Password Match:', passwordMatch);

        const payload = {
            email: user.email,
            id: user._id
        };

        if (passwordMatch) {
            // password match
            // Generate JWT token
            const payload = {
                email: user.email,
                id: user._id
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h" // Token expires in 2 hours
            });

            // Set the token in cookies
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Cookie expires in 3 days
                httpOnly: true
            });

            // Remove password from user object before sending it in the response
            user.password = undefined;

            // Send success response with token and user data
            res.status(200).json({
                success: true,
                token,
                user,
                message: "User logged in successfully"
            });
        } else {
            // password not match
            return res.status(403).json({
                success: false,
                message: "Password incorrect",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot login, please try again later",
        });
    }
}








