# Design

This site is based around the idea of service providers that need to collect worksheets from clients. These relationships could be things like:

- Tutor / student
- Therapist / client
- Life or Executive coach / Client
- Financial Planner / client
- Lawyer / client
- Healthcare (OT/PT/Speech) / Client

My idea is to charge a low monthly fee ($5-10/mo) and build a client base. Some of these use cases involve more compliance issues (HIPAA, or attorney/client privelege). Some of these use cases imply that there should be solid boundaries between providers (only a provider can see their client's data). In addition, the system admin should not be able to see any client worksheets since these may contain confidential data.


## System Admin
Once admin has logged in, they can:
- View a list of providers
- Add, edit, suspend, and remove providers
- View billing info for providers
- Override billing info for providers (to apply discounts or credits)
- Review and respond to support requests.

## Provider
Provider account creation is self-service. The provider creates and account for themselves and can then invite their clients to the site. 

Once provider has logged in, they can:
- View a list of clients
- Add, edit, suspend, and remove clients (individually, bulk import later)
- Invite clients to use the system via email or SMS
- View client worksheets
- Add, edit, and remove client worksheets
- Review client worksheets, add notes, and provide feedback to clients or request changes.
- Submit billing info for the site, update payment methods.
- Download invoices for site usage.
- Export client worksheets as PDF
- Print client worksheets
- Submit support requests

## Client

Clients get invited to the system by their provider. They receive a text or email with a link to create an account.

Authentication is done through a one time passcode process, either email or SMS with an OTP to login.

Once client has logged in, they can:
- View a list of worksheets assigned to them
- Complete and submit worksheets
- View completed worksheets
- View provider notes and feedback


## Other Uses

Other types of providers: OT, PT, etc

Life coaches/executive coaches.

Financial planners

Teachers & Tutors

## Future Features

- Be able to group clients together
- Give assignments to groups
- Operations on groups like gathering all their worksheets from an assignment

## Security Concerns

HIPAA
Attorney/Client privilege
Misuse - think about how a system like this could be applied to illegal activities.

One place I could see trouble is if the site allows uploading data securely, it could be used as a relatively low-cost file exchange mechanism. Also unlimited data uploads could break my storage budgets.

[ChatGPT brainstorming session](https://chatgpt.com/share/6846c79f-55f8-800f-8aba-1ec4d1ec2158)

## Integration with FormExpert

Matt Bernier from ID345

https://formexpert.co/

Might need to deal with FE not storing form data at rest - they ship it to us and we store it on our servers, encrypted.

- encrypt data at rest
- salt encrypition with something related to the login session
- only decrypted when user is logged in
- bring your own key

## Integration with Google forms
samples
https://docs.google.com/forms/d/e/1FAIpQLSdrQocAB2lXP7n1Fq1_PO3gDvN0D4Crl7ZG8b-xPaLOcGo8bw/viewform?usp=header
https://forms.gle/zpDJyJX56HEj9LVv8

## PDF Forms

### Competition
https://clevika-mvp.vercel.app/#features
More oriented towards tutoring
AI-generated worksheets

https://toolsedu.com/
Building education worksheets / assignments

https://zapier.com/blog/best-online-form-builder-software/#formstack
https://www.formstack.com/pricing
Forms - enterprise level is negotiated includes things like HIPAA

https://www.formsite.com/
Built on Formstack