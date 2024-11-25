export default function validateFullName(fullName: string): string {
    const fullNameRegexString = process.env.REACT_APP_FULLNAME_REGEX;

    if (!fullNameRegexString) {
        throw new Error("REACT_APP_FULLNAME_REGEX is not defined in .env file");
    }

    const fullNameRegex = new RegExp(fullNameRegexString + "");
    if (fullNameRegex.test(fullName)) {
        return "";
    } else {
        return "Tên người dùng không hợp lệ";
    }
}
