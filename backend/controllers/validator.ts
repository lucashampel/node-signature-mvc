export function IsValidCPF(cpf: string): boolean{
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calcCheck = (len: number) => {
    const sum = cpf
      .slice(0, len)
      .split('')
      .reduce((acc, num, i) => acc + Number(num) * (len + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calcCheck(9) === Number(cpf[9]) && calcCheck(10) === Number(cpf[10]);
}
export type BirthDateResult =  | { ok: true }  | { ok: false; error: string };

export function IsValidBirthDate(birthDate : string): BirthDateResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { ok: false, error: 'Birth date must be in YYYY-MM-DD format.' };
  }

  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid birth date.' };
  }

  const today = new Date();
  if (date > today) {
    return { ok: false, error: 'Birth date cannot be in the future.' };
  }
  return { ok: true };
}