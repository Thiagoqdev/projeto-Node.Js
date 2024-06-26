import mongoose from "mongoose";
import Product from "../model/Product.js";
import UserService from "./UserService.js";
import User from "../model/User.js";

export default class ProductService {
  // Define o método estático assíncrono 'create' com os parâmetros 'req', 'name', 'description', 'state' e 'purchased_at'
   static async create(req, name, description, state, purchased_at) {
        // Obtém o usuário atual através do serviço de usuários usando as informações da requisição
        const user = await UserService.getUser(req);

        // Inicializa um array vazio para armazenar as imagens
        let images = [];
        // Verifica se há arquivos na requisição
        if (req.files) {
            // Se houver, armazena-os no array 'images'
            images = req.files;
        }

        // Define a variável 'available' como true para indicar que o produto está disponível
        const available = true;

        // Verifica se o nome do produto foi fornecido
        if (!name) {
            // Se não, cria um novo erro com a mensagem "O nome é obrigatório."
            const error = new Error("O nome é obrigatório.");
            // Define o status code do erro para 422 (Unprocessable Entity)
            error.statusCode = 422;
            // Lança o erro, interrompendo a execução do código
            throw error;
        }

        // Verifica se a descrição do produto foi fornecida
        if (!description) {
            // Se não, cria um novo erro com a mensagem "A descrição é obrigatória."
            const error = new Error("A descrição é obrigatória.");
            // Define o status code do erro para 422 (Unprocessable Entity)
            error.statusCode = 422;
            // Lança o erro, interrompendo a execução do código
            throw error;
        }

        // Verifica se o estado do produto foi fornecido
        if (!state) {
            // Se não, cria um novo erro com a mensagem "O estado é obrigatório."
            const error = new Error("O estado é obrigatório.");
            // Define o status code do erro para 422 (Unprocessable Entity)
            error.statusCode = 422;
            // Lança o erro, interrompendo a execução do código
            throw error;
        }

        // Verifica se a data de compra do produto foi fornecida
        if (!purchased_at) {
            // Se não, cria um novo erro com a mensagem "A data de compra é obrigatória."
            const error = new Error("A data de compra é obrigatória.");
            // Define o status code do erro para 422 (Unprocessable Entity)
            error.statusCode = 422;
            // Lança o erro, interrompendo a execução do código
            throw error;
        }

        // Verifica se pelo menos uma imagem foi fornecida
        if (images.length === 0) {
            // Se não, cria um novo erro com a mensagem "A imagem é obrigatória."
            const error = new Error("A imagem é obrigatória.");
            // Define o status code do erro para 422 (Unprocessable Entity)
            error.statusCode = 422;
            // Lança o erro, interrompendo a execução do código
            throw error;
        }

        // Cria uma nova instância de Product com os dados fornecidos, incluindo o ID do proprietário (user._id) e um array vazio de imagens
        const product = new Product({name, description, state, owner: user._id, available, images: []});

        // Itera sobre o array de imagens e adiciona cada filename ao array de imagens do produto
        images.map((image) => product.images.push(image.filename));

        // Salva a nova instância de produto no banco de dados e aguarda a conclusão do processo
        const productSaved = await product.save();

        // Retorna o produto salvo como resultado da função
        return productSaved;
    }

  // Define o método estático assíncrono 'index' com os parâmetros 'page' e 'limit'
     static async index(page, limit) {
        // Busca todos os produtos no banco de dados, ordenados pela data de criação em ordem decrescente
        // Limita o número de produtos retornados ao valor de 'limit'
        // Pula um número de produtos calculado pela fórmula '(page-1) * limit' para paginação
        // Popula o campo 'owner' do produto, excluindo o campo 'password'
        // Popula também o campo 'reciever' do produto
        const products = await Product.find()
            .sort("-createdAt")
            .limit(limit)
            .skip((page - 1) * limit)
            .populate({ path: "owner", select: "-password" })
            .populate("reciever");

        // Retorna a lista de produtos encontrados
        return products;
    }

    static async deleteProduct() {
    //Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("ID inválido.");
      error.statusCode = 400;
      throw error;
    }

    //Busca o produto pelo ID
    const product = await Product.findById(id);

    //Verifica se o produto foi encontrado
    if (!product) {
      const error = new Error("Produto não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    // Deleta o produto
    await Product.findByIdAndDelete(id);

    return;
    }

  static async showUserProducts() {}

  static async showRecieverProducts() {}

  static async scheduleProduct() {
    //Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("ID inválido.");
      error.statusCode = 400;
      throw error;
    }

    //Busca o produto pelo ID
    const product = await Product.findById(id);

    //Verifica se o produto foi encontrado
    if (!product) {
      const error = new Error("Produto não encontrado.");
      error.statusCode = 404;
      throw error;
    }

    //Verifica se o produto está disponível
    if (!product.available) {
      const error = new Error("Produto não disponível.");
      error.statusCode = 400;
      throw error;
    }

    // Obtém o usuário pelo token
    const user = await UserService.getUser(req);

    // Verifica se o usuário é proprietário do produto
    if (!product.owner.equals(user._id)) {
      const error = new Error("Você não é o proprietário deste produto.");
      error.statusCode = 403;
      throw error;
    }

    // Atualiza o atributo receiver do produto
    product.reciever = user._id;
    product.available = false;
    await product.save();

    // Retorna a mensagem de sucesso
    return `A visita foi agendada com Sucesso, entre em contato com ${user.name}, pelo telefone, ${user.phone}`;
  }

  static idValidation(idFromReq) {
    if (!idFromReq) {
      const error = new Error("Id não encontrado");
      error.statusCode = 404;
      throw error;
    }
  }

  static async productbyIdValidator(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Id da requisição não encontrado.");
      error.statusCode = 404;
      throw error;
    } else {
      return id;
    }
  }

  static async getProductById(id) {
    const product = await Product.findOne({ _id: id });
    
    if (!product) {
      const error = new Error("Produto não encontrado.");
      error.statusCode = 404;
      throw error;
    } else {
      return product;
    }
  }

  static async getUserByToken(req) {
    if (!req.user) {
      const error = new Error("Acesso Negado.");
      error.statusCode = 401;
      throw error;
    }

    const user = User.findOne({ _id: req.user.id }).select("-password");
    return user;
  }

  static async getProductbyId(req) {
    const product = await Product.findById(req.Product._id).select("-password");

    if (!product) {
      const error = new Error("Produto não existe.");
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  static async showById(id){
    const idFromRequest = ProductService.idValidation(id);
    const product = ProductService.getProductById(idFromRequest);
    return product
  }
}
