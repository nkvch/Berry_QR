
import { useState } from "react";
import { Alert, Button, View } from "react-native";
import Form from "../components/Form";
import PaginatedTable from "../components/PaginatedTable";
import styles from "../styles/styles";
import useUser from "../utils/hooks/useUser";
import request from "../utils/request";

const foremenColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
};

const employeeColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
};

const productColumns = {
  id: {
    name: 'id',
    type: 'number',
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
  },
  productName: {
    name: 'Имя',
    type: 'text',
  },
};

const columns = {
  id: {
    name: 'ID',
    type: 'number',
    hidden: true,
  },
  employeeId: {
    type: 'number',
    hidden: true,
  },
  productId: {
    type: 'number',
    hidden: true,
  },
  amount: {
    name: 'Количество (кг)',
    type: 'number',
  },
  dateTime: {
    name: 'Дата и время',
    type: 'dateTime',
  },
  employee: {
    name: 'Сотрудник',
    type: 'included',
    parse: emp => emp ? `${emp.firstName} ${emp.lastName}` : 'Нет данных',
  },
  product: {
    name: 'Продукт',
    type: 'included',
    hidden: true,
    parse: prod => prod?.productName || 'Нет данных',
  },
  foreman: {
    name: 'Бригадир',
    type: 'included',
    hidden: true,
    parse: () => {},
  },
};

const actions = {
  delete: {
    icon: 'delete',
    action: (rec, _, refetch, forceLoading) => {
      Alert.alert(
        'Удаление записи из истории',
        `Вы действительно хотите запись ${rec.id} ${rec.employee?.firstName || ''} ${rec.employee?.lastName || ''} ${rec.product?.productName || ''} ${rec.amount}?`,
        [{
          text: 'Удалить',
          onPress: () => {
            forceLoading(true);

            request({
              url: `/history/${rec.id}`,
              method: 'DELETE',
              callback: (status, response) => {
                if (status === 'ok') {
                  Alert.alert(
                    'Запись успешно удалена',
                    ''
                    [{ text: 'OK' }],
                  );
                  refetch();
                } else {
                  Alert.alert(
                    'Ошибка при удалении записи',
                    response.message,
                    [{ text: 'OK' }],
                  );
                };
              },
            });
          },
          style: 'destructive',
        }, {
          text: 'Отменить',
          onPress: () => {},
          style: 'cancel',
        }],
      )
    },
  },
};

const Stats = props => {
  const [filters, setFilters] = useState({});
  const me = useUser();

  const [showFilters, setShowFilters] = useState(false);

  const fieldsData = {
    ...(me.role === 'admin' && {
      foreman: {
        label: 'Бригадир',
        type: 'fetch-select',
        fetchSelectConfig: {
          url: '/foremen',
          columns: foremenColumns,
          showInOption: ['firstName', 'lastName'],
          icon: 'photoPath',
          returnValue: 'id',
        },
      },
    }),
    employee: {
      label: 'Сотрудник',
      type: 'fetch-select',
      fetchSelectConfig: {
        url: '/employees',
        columns: employeeColumns,
        showInOption: ['firstName', 'lastName'],
        icon: 'photoPath',
        returnValue: 'id',
      },
    },
    product: {
      label: 'Продукт',
      type: 'fetch-select',
      fetchSelectConfig: {
        url: '/products',
        columns: productColumns,
        showInOption: ['productName'],
        icon: 'photoPath',
        returnValue: 'id',
      },
    },
    fromDateTime: {
      label: 'От',
      type: 'datetime',
    },
    toDateTime: {
      label: 'До',
      type: 'datetime',
    },
  };

  const onChangeFilters = values => {
    setShowFilters(false);
    setFilters(values);
  };

  const getFilters = () => {
    const { fromDateTime, toDateTime, ...restFilters } = filters;

    return {
      ...restFilters,

      ...(fromDateTime && {
        fromDateTime: fromDateTime.toISOString(),
      }),

      ...(toDateTime && {
        toDateTime: toDateTime.toISOString(),
      }),

      ...(me.role === 'foreman' && {
        foreman: me.id,
      }),
    };
  };

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <Form
          fieldsData={fieldsData}
          onSubmit={onChangeFilters}
          submitText="Фильровать"
          resetable
          resetText="Сбросить фильтры"
          hidden={!showFilters}
        />
        {
          !showFilters && (
            <>
              <Button
                title="Фильтры"
                onPress={() => setShowFilters(true)}
              />
              <PaginatedTable
                url="/history"
                columns={columns}
                noSearch
                customFilters={getFilters()}
                actions={actions}
              />
          </>
          )
        }
      </View>
    </View>
  )
};

export default Stats;
