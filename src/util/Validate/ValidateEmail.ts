export default function validateEmail(email: string): string {
    const emailRegexString = process.env.REACT_APP_EMAIL_REGEX;

    if (!emailRegexString) {
        throw new Error("REACT_APP_EMAIL_REGEX is not defined in .env file");
    }

    const emailRegex = new RegExp(emailRegexString + "");
    if (emailRegex.test(email)) {
        return "";
    } else {
        return "Email không hợp lệ";
    }
}
