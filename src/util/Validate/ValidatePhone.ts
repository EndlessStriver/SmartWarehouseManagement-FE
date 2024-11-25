export default function validatePhone(phone: string): string {
    const phoneRegexString = process.env.REACT_APP_PHONE_REGEX;

    if (!phoneRegexString) {
        throw new Error("REACT_APP_PHONE_REGEX is not defined in .env file");
    }

    const fullNameRegex = new RegExp(phoneRegexString + "");
    if (fullNameRegex.test(phone)) {
        return "";
    } else {
        return "Số điện thoại không hợp lệ";
    }
}
