export function calcularValorTotalComDesconto(quantidadeProduto: number, valorBase: number, porcentagemDesconto: number): number {
    const valorSemDesconto = quantidadeProduto * valorBase;
    const desconto = (porcentagemDesconto / 100) * valorSemDesconto;
    const valorComDesconto = valorSemDesconto - desconto;
    return valorComDesconto;
  }
  