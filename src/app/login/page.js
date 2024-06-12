import { Suspense } from "react"
import LoginContent from "./loginContent"

export default function Login() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    )
}