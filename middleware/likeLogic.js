// let buttons = document.querySelectorAll('.likes-btn');
// //every button with class of likes
// for(let button of buttons){
//     //get each button and add event listener
//     button.addEventListener('click', likePost)
//         //make sure user in logged in
    
//     async function likePost(){
//         console.log(button.id)
//     if (req.session.isLoggedIn) {
//         //find event by id which should be the same as the button
//         const thisEvent = Event.findById(button.id)
//         //but the current user and add the like
//         const currentUser = await User.findByIdAndUpdate(req.session.userId,{
//             $push:{likes:thisEvent}
//         })
//         //if no one is logged in don't do all that
//       } else {
//         alert("You must be logged in to Like events")
//       }
//     }
// }