const inquirer = require('inquirer');
const chalk = require("chalk")

const fs = require("fs");
const { json } = require('stream/consumers');

operation()

function operation() {
    inquirer
     .prompt([
        {
        type:'list',
        name:'action',
        message:'O que voce deseja fazer?',
        choices: ['Criar Conta','Consultar Saldo','Depositar','Sacar','Sair'],
    },
  ])
  .then((answer) => {
    const action = answer['action']
    
    if (action === 'Criar Conta') {
       createAccount() 

    } else if(action === 'Depositar'){
        deposit()

    } else if(action === 'Consultar Saldo'){
        getAccountBalance()
    } else if(action === 'Sacar'){
        withdraw()

    } else if(action === 'Sair'){
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
        process.exit()
    }
  })
  .catch((err) => console.log(err))
}

function createAccount() {
    console.log(chalk.bgGreen.black('Parabens por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opcoes da sua conta a seguir'))

    buildAccount()
}

function buildAccount() {

    inquirer.prompt([

        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'
        }

    ])
    .then((answer) => {
        const accountName = answer['accountName']

        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }
        
        if (fs.existsSync(`accounts/${accountName}.json`)){
            console.log(
                chalk.bgRed.black('Esta conta ja existe, escolha outro nome!'),
            )
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (err){
            console.log(err)
        },
      )

      console.log(chalk.green('Parabens, a sua conta foi criada!'))
      operation()
    })
    .catch((err) => console.log(err))
    
}

function deposit () {

    inquirer.prompt([
    {
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }
])
.then((answer) =>{

    const accountName = answer['accountName']

    if (!checkAccount(accountName)) {
        return deposit()
    }

    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto voce deseja depositar ?',
        },
    ]).then((answer) =>{

        const amount = answer['amount']


        addAmount(accountName,amount)
        operation()


    }).catch((err) => console.log(err))

})
.catch(err => console.log(err))

}

function checkAccount(accountName) {

    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta nao existe, escolha outro nome!'))
        return false
    }

    return true

}

function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if (!amount) {
        console.log (chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )

    console.log(
        chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`),
    )
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,{
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer["accountName"]

        if (!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Ola, o saldo da sua conta e de R$${accountData.balance}`,
        ),
    )
    operation()

    }).catch(err => console.log(err))
}

function withdraw() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta ?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto voce deseja sacar ?'
            }
        ]).then((answer) => {
            const amount = answer['amount']

            removeAmount(accountName, amount)

        }).catch(err => console.log(err))

    }).catch((err) => console.log(err))

}

function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {

        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'),
    )
    return withdraw()
}

if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponivel'))
    return withdraw()
}

accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function(err) {
        console.log(err)
    },
)

console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta`))
operation()

}