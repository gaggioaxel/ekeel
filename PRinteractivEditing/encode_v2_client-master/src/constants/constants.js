export default {
    TOPIC_TYPE:{
        OCCURRENCE  : 'occurrence',
        TOPIC       : 'topic',
        SCOPE       : 'scope',
        TOPIC_MAP   : 'topicMap'
    },

    API_URL : 'http://localhost:8080',

    API_HEADERS : {
        'Content-Type'  : 'application/json',
        'X-Auth'   : ''
    },

    MISMATCH_TYPED_PASSWORD: 'Password and Re-typed Password must be identical.',
    USERNAME_FIELD_BLANK: 'Username field cannot be blank.',
    FIRSTNAME_FIELD_BLANK: 'First Name field cannot be blank.',
    LASTNAME_FIELD_BLANK: 'Last Name field cannot be blank.',
    PASSWORD_FIELD_BLANK: 'Password field cannot be blank.',
    RETYPED_PASSWORD_FIELD_BLANK: 'Re-Type password field cannot be blank',
    EMAIL_FIELD_BLANK: 'Email field cannot be blank',
    WRONG_EMAIL_FORMAT: 'Please provide a correct email format.',

    TIMEOUT_LENGTH : 5000,
};