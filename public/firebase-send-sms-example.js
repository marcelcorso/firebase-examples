document.addEventListener('DOMContentLoaded', function () {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

    try {
        window.app = firebase.app();
        window.db = firebase.firestore();

        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        console.log(`Firebase SDK loaded with ${features.join(', ')}`);

        init();
    } catch (e) {
        console.error(e);
        document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    }
});

function showSection(id) {
    const sections = document.getElementsByTagName("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }
    const active = document.getElementById(id);
    active.classList.add("active");
}

function init() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
        'size': 'invisible',
        'callback': function (response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            showSection("ask-tel");
        }
    });

    document.getElementById("sign-in-button").addEventListener("click", () => {
        showSection("ask-tel");
    });
    document.getElementById("send-code").addEventListener("click", onSendCodeClick);
    document.getElementById("verify-code").addEventListener("click", onVerifyCodeClick);
    document.getElementById("lets-start").addEventListener("click", () => {
        showSection("conversations");
    });
    document.getElementById("send-msg-fact").addEventListener("click", onSendConversationFact);
}

function onSendCodeClick(e) {
    e.preventDefault();
    const tel = document.getElementById("tel").value;
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(tel, appVerifier)
        .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;

            showSection("ask-code");

        }).catch(function (error) {
            // Error; SMS not sent
            // ...
            console.error(error);
        }
    );
}

function onVerifyCodeClick(e) {
    e.preventDefault();

    const code = document.getElementById("code").value;
    confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        window.user = result.user;

        console.log(user);

        showSection("we-gotchu");

        // ...
    }).catch(function (error) {
        // User couldn't sign in (bad verification code?)
        console.error(error);
    });
}

function onSendConversationFact() {
    // to send a fact to a user just add it to a collection. the plugin will send the message
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    db.collection("msg").add({
        to: document.getElementById("recipient").value,
        channelId: document.getElementById("channelId").value,
        type: "text",
        content: {
            text: randomFact
        }
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            reportStatus(docRef)
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

    document.getElementById("send-msg-fact").innerText = labels[Math.floor(Math.random() * labels.length)];
}

function reportStatus(docRef) {
    const result = document.getElementById("delivery-result");
    result.classList.add("active");

    docRef.onSnapshot(docSnapshot => {
        const { delivery } = docSnapshot.data();
        // report status back
        if (delivery) {
            const text = JSON.stringify(delivery, null, 4)
            const current = document.getElementById("result-history").value
            document.getElementById("result-output").innerHTML = text;
            document.getElementById("result-history").value = current + "\n\n" + new Date().toLocaleTimeString() + ": " + text;
        }
      }, err => {
        console.log(`Encountered error: ${err}`);
      });
}

const labels = ["I love it. Get me another.",
        "Another one, please.",
        "Sweet. Give me more.",
        "more!", "yes, yes, yes!", "can I have another?",
        "Oh yes. One more?"];

// from https://www.thefactsite.com/top-100-random-funny-facts/
const facts = ["Banging your head against a wall for one hour burns 150 calories.",
    "In Switzerland it is illegal to own just one guinea pig.",
    "Pteronophobia is the fear of being tickled by feathers.",
    "Snakes can help predict earthquakes.", "A flock of crows is known as a murder.", "The oldest “your mom” joke was discovered on a 3,500 year old Babylonian tablet.", "So far, two diseases have successfully been eradicated: smallpox and rinderpest.", "29th May is officially “Put a Pillow on Your Fridge Day”.", "Cherophobia is an irrational fear of fun or happiness.", "7% of American adults believe that chocolate milk comes from brown cows.", "If you lift a kangaroo’s tail off the ground it can’t hop.", "Bananas are curved because they grow towards the sun.", "Billy goats urinate on their own heads to smell more attractive to females.", "The inventor of the Frisbee was cremated and made into a Frisbee after he died.", "During your lifetime, you will produce enough saliva to fill two swimming pools.", "If Pinocchio says “My Nose Will Grow Now”, it would cause a paradox.", "Polar bears could eat as many as 86 penguins in a single sitting…", "King Henry VIII slept with a gigantic axe beside him.", "Movie trailers were originally shown after the movie, which is why they were called “trailers”.", "An eagle can kill a young deer and fly away with it.", "Heart attacks are more likely to happen on a Monday.", "Tennis players are not allowed to swear when they are playing in Wimbledon.", "In 2017 more people were killed from injuries caused by taking a selfie than by shark attacks.", "The top six foods that make your fart are beans, corn, bell peppers, cauliflower, cabbage and milk.", "There is a species of spider called the Hobo Spider.", "A lion’s roar can be heard from 5 miles away.", "Saint Lucia is the only country in the world named after a woman.", "A baby spider is called a spiderling.", "The United States Navy has started using Xbox controllers for their periscopes.", "The following can be read forward and backwards: Do geese see God?", "A baby octopus is about the size of a flea when it is born.", "A sheep, a duck and a rooster were the first passengers in a hot air balloon.", "In Uganda, around 48% of the population is under 15 years of age.", "The average male gets bored of a shopping trip after 26 minutes.", "In the 16th Century, Turkish women could initiate …ce if their husbands didn’t pour coffee for them.", "Recycling one glass jar saves enough energy to watch television for 3 hours.", "After the premiere of “16 and Pregnant,” teen pregnancy rates dropped.", "Approximately 10-20% of U.S. power outages are caused by squirrels.", "Facebook, Instagram and Twitter are all banned in China.", "95% of people text things they could never say in person.", "Honeybees can recognize human faces.", "The Battle of Hastings didn’t take place in Hastings.", "While trying to find a cure for AIDS, the Mayo Clinic made glow in the dark cats.", "A swarm of 20,000 bees followed a car for two days because their queen was stuck inside.", "Nearly 3% of the ice in Antarctic glaciers is penguin urine.", "Bob Dylan’s real name is Robert Zimmerman.", "A crocodile can’t poke its tongue out.", "Sea otters hold hands when they sleep so they don’t drift away from each other.", "A small child could swim through the veins of a blue whale.", "Bin Laden’s death was announced on 1st May 2011. Hitler’s death was announced on 1st May 1945.", "J.K. Rowling chose the unusual name “Hermione” so young girls wouldn’t be teased for being nerdy.", "Hewlett-Packard’s (also known as HP) name was decided in a coin toss in 1939.", "There is a total of 1,710 steps in the Eiffel Tower.", "The Pokémon Hitmonlee and Hitmonchan are based off of Bruce Lee and Jackie Chan.", "A woman tried to commit suicide by jumping off the…blown back onto the 85th floor by a gust of wind.", "Pirates wore earrings because they believed it improved their eyesight.", "Los Angeles’s full name is “El Pueblo de Nuestra Senora la Reina de los Angeles de Porciuncula.”", "The Twitter bird actually has a name – Larry.", "Octopuses have four pairs of arms.", "In the popular sitcom, Parks and Recreation, the w…player when they wrote the Duke Silver plot line.", "It snowed in the Sahara desert for 30 minutes on the 18th February 1979.", "Mike Tyson once offered a zoo attendant 10,000 dollars to let him fight a gorilla.", "ABBA turned down 1 billion dollars to do a reunion tour.", "There has never been a verified snow leopard attack on a human being.", "The first alarm clock could only ring at 4 a.m.", "Birds don’t urinate.", "Dying is illegal in the Houses of Parliaments.", "The most venomous jellyfish in the world is the Irukandji.", "The 20th of March is Snowman Burning Day.", "Queen Elizabeth can’t sit on the Iron Throne from Game of Thrones.", "There is official Wizard of New Zealand.", "An apple, potato, and onion all taste the same if you eat them with your nose plugged.", "Vincent van Gogh only sold one painting in his lifetime.", "A company in Taiwan makes dinnerware out of wheat, so you can eat your plate!", "The average person walks the equivalent of five times around the world in their lifetime.", "Michael Jackson offered to make a Harry Potter musical, but J.K. Rowling rejected the idea.", "The world record for stuffing drinking straws into your mouth at once is 459.", "Nutella was invented during WWII, when hazelnuts w…mixed into chocolate to extend chocolate rations.", "In 2011, more than 1 in 3 divorce filings in the U.S. contained the word “Facebook.”", "According to Genesis 1:20-22 the chicken came before the egg.", "Honeybees can get drunk on fermented tree sap.", "Tears contain a natural pain killer which reduces pain and improves your mood.", "Squirrels forget where they hide about half of their nuts.", "Millions of birds a year die from smashing into windows in the U.S. alone.", "Dolly Parton lost in a Dolly Parton look-alike contest.", "George W. Bush was once a cheerleader.", "In total, there are 205 bones in the skeleton of a horse.", "Coca-Cola owns all website URLs that can be read as ahh, all the way up to 62 h’s.", "Each year there are more than 40,000 toilet related injuries in the United States.", "Strawberries can be red, yellow, green or white.", "Mewtwo is a clone of the Pokémon Mew, yet it comes before Mew in the Pokédex.", "Four people lived in a home for 6 months infested …wn recluse spiders, but none of them were harmed.", "Madonna suffers from brontophobia, which is the fear of thunder.", "In June 2017, the Facebook community reached 2 billion active users.", "Samuel L. Jackson requested a purple lightsaber in…n order for him to accept the part as Mace Windu.", "Paraskavedekatriaphobia is the fear of Friday the 13th.", "Kleenex tissues were originally used as filters in gas masks.", "In 1998, Sony accidentally sold 700,000 camcorders…d the technology to see through people’s clothes.", "During your lifetime, you will spend around thirty-eight days brushing your teeth.", "Ronald McDonald is “Donald McDonald” in Japan beca…e it makes pronunciation easier for the Japanese."];
