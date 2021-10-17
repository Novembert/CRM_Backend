context('Endpoints Requests', () => {
  before(function () {
    cy.exec('npm run seed')
  })

  describe('Login to system', function () {
    beforeEach (function () {
      cy.fixture('auth').then(function (auth) {
        this.auth = auth
      })      
    })

    it('throws error when trying to login with bad credentials', () => {
      cy.request({
        method: 'POST',
        url: 'localhost:5000/api/auth',
        body: {
          login: 'nBujnyTest',
          password: 'testtest'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response).property('status').to.equal(400)
        expect(response && response.body, 'response body').to.deep.equal({
          errors: [
            {
              msg: "Nieprawidłowe dane logowania"
            }
          ]
        })
      })
    })
  
    it('can log in', function () {
      cy.request({
        method: 'POST',
        url: 'localhost:5000/api/auth',
        body: {
          login: this.auth.workerLogin,
          password: this.auth.workerPassword
        },
      }).then((response) => {
        expect(response).property('status').to.equal(200)
        cy.setCookie('token', response.body.token)
      })
    })

    // it('can get roles', function () {
    //   cy.request({
    //     url: 'localhost:5000/api/roles',
    //     headers: {
    //       ['x-auth-token ']: cy.getCookie('token')
    //     }
    //   }).then((response) => {
    //     expect(response).property('status').to.equal(200)
    //   })
    // })
  })
})