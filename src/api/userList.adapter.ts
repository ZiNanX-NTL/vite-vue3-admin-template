export function adapterOfFetchUserList(data: any) {
  if (!data) return {};

  data.records = data.records.map((item: any, index: number) => {
    const user = {
      index: index + 1,
      key: item.id,
      ...item
    };

    return user;
  });

  return data;
}
