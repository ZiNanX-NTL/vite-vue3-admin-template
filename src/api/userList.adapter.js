export function adapterOfFetchUserList(data) {
  if (!data) return {};

  data.records = data.records.map((item, index) => {
    const user = {
      index: index + 1,
      key: item.id,
      ...item
    };

    return user;
  });

  return data;
}
