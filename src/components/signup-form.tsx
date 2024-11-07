// "use client";

// import {useFormState, useFormStatus} from "react-dom"
 
// async function signup(FormData: FormData){

// }

// export function SignupForm (){
//     const [state, action] = useFormState(signup, undefined)
//     return(
//         <form action={action}>
//             <div>
//                 <label htmlFor="name">Name</label>
//                 <input id="name" name="name" type="text" placeholder="Name" />
//             </div>
//             <div>
//                 <label htmlFor="email">Email</label>
//                 <input id="email" name="email" type="email" placeholder="Email" />
//             </div>
//             <div>
//                 <label htmlFor="password">Password</label>
//                 <input id="password" name="password" type="password" placeholder="********" />
//             </div>
//             <SubmitButton/>
//         </form>
//     )
// }

// function SubmitButton(){
//     const {pending} = useFormStatus()

//     return (
//         <button disabled= {pending} type="submit">
//             Sign Up
//         </button>
//     )
// }