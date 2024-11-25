export default function ValidatePassword(password: string): string {
    const passwordRegexString = process.env.REACT_APP_PASSWORD_REGEX;

    if (!passwordRegexString) {
        throw new Error("REACT_APP_PASSWORD_REGEX is not defined in .env file");
    }

    const passwordRegex = new RegExp(passwordRegexString + "");
    if (passwordRegex.test(password)) {
        return ""
    } else {
        return "Mật khẩu tối thiểu tám ký tự, ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt"
    }
}
