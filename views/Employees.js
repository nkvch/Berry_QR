import PaginatedTable from "../components/PaginatedTable";
import { View } from "react-native";
import styles from "../styles/styles";
import { Linking, Platform } from "react-native";
import { useState } from "react";
import useUser from "../utils/hooks/useUser";
import { Alert } from "react-native";
import request from "../utils/request";
import { Button, Checkbox } from "react-native-paper";

const url = '/employees';

const employeeFlags = [
  { value: 'isWorking', text: 'Работает', color: '#fc7303' },
  { value: 'printedQR', text: 'QR распечатан', color: '#03a5fc' },
  { value: 'blacklisted', text: 'Черный список', color: '#808080' },
  { value: 'goodWorker', text: 'Хороший работник', color: '#1e9e05' },
  { value: 'workedBefore', text: 'Работал прежде', color: '#d9c045' },
  { value: 'wontWork', text: 'Не будет работать', color: '#BF156C' },
];

const columns = {
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
};

const hiddenButRequiredData = [
  'id',
  'foremanId',
  'berryId',
  'phone',
  'additionalPhone',
  ...(employeeFlags.map(({ value }) => value)),
];

const foremanColumns = {
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

const addFieldsData = {
  firstName: {
    label: 'Имя сотрудника',
    type: 'text',
  },
  lastName: {
    label: 'Фамилия сотрудника',
    type: 'text',
  },
  contract: {
    label: 'Нумар кантракту',
    type: 'text',
  },
  address: {
    label: 'Адрас',
    type: 'text',
  },
  phone: {
    label: 'Тэлефон',
    type: 'phone',
  },
  foremanId: {
    label: 'Выберите бригадира',
    type: 'fetch-select',
    fetchSelectConfig: {
      url: '/foremen',
      columns: foremanColumns,
      showInOption: ['firstName', 'lastName'],
      showInValue: ['firstName', 'lastName'],
      returnValue: 'id',
    }
  },
  photo: {
    label: 'Выберите или перетащите сюда фотографию',
    type: 'file',
  },
};

const chips = Object.fromEntries(employeeFlags.map(({ value, text, color }) => ([
  value,
  {
    show: emp => emp[value],
    label: text,
    style: {
      backgroundColor: color,
      width: text.length * 9,
      height: 30,
    },
    textStyle: {
      fontSize: 11,
    },
  },
])));

const Employees = ({ jumpTo, adding }) => {
  const me = useUser();

  const initFilters = me.role === 'foreman' ? { foremanId: me.id } : {};
  const [customFilters, setCustomFilters] = useState(initFilters);

  const onChangeFilters = values => {
    const { isWorking, foremanId } = values;
    setCustomFilters({
      ...(typeof foremanId === 'number' && { foremanId }),
      ...(isWorking !== 'null' && { isWorking }),
    });
  };

  const filters = {
    fieldsData: {
      ...(me.role === 'admin' && {
        foremanId: {
          label: 'Фильтровать по бригаде',
          type: 'fetch-select',
          fetchSelectConfig: {
            url: '/foremen',
            columns: {
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
            },
            showInOption: ['firstName', 'lastName'],
            icon: 'photoPath',
            returnValue: 'id',
          },
        },
      }),
      isWorking: {
        label: 'Фильтровать по смене',
        type: 'select',
        selectConfig: {
          options: [
            { value: 'true', label: 'Работающие' },
            { value: 'false', label: 'Не работающие' },
            { value: 'null', label: 'Все' },
          ],
        },
        defaultValue: 'null',
      },
    },
    className: 'inline-form',
    submitable: false,
    onChangeCallback: onChangeFilters,
  };

  const onAdd = values => {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) =>
      formData.append(key, value)
    );

    request({
      url: '/employees',
      method: 'POST',
      body: formData,
      withFiles: true,
      callback: (status, response) => {
        if (status === 'ok') {
          const { firstName, lastName } = response.data;

          Alert.alert(
            'Добавление сотруденика',
            `Сотрудник ${firstName} ${lastName} успешно добавлен`,
            [{ text: 'ОК' }],
          );

          jumpTo('employees', { adding: false });
        } else {
          const { message } = response;

          Alert.alert(
            'Добавление сотруденика',
            `Ошибка: ${message}`,
            [{ text: 'ОК' }],
          )
        }
      },
    });
  };

  const actions = {
    call: {
      label: 'Позвонить',
      icon: 'cellphone-basic',
      action: emp => {
        if (emp.additionalPhone) {
          Alert.alert(
            'Позвонить',
            'На какой телефон звоним?',
            [{
              text: `Основной (+${emp.phone})`,
              onPress: () => Linking.openURL(`tel:+${emp.phone}`),
            }, {
              text: `Дополнительный (+${emp.additionalPhone})`,
              onPress: () => Linking.openURL(`tel:+${emp.additionalPhone}`),
            }]
          );
        } else {
          Linking.openURL(`tel:+${emp.phone}`);
        }
      },
    },
    goToAddress: {
      label: 'Найти',
      icon: 'map-marker',
      action: emp => {
        const buttons = [{
          text: 'Отмена',
        }];
  
        if (emp.address) {
          buttons.unshift({
            text: 'Адрес проживания',
            onPress: () => {
              const urlMap = Platform.select({
                ios: `maps:0,0?q=${emp.address}`,
                android: `geo:0,0?q=${emp.address}`,
              })
              
              Linking.openURL(urlMap);
            },
          });
        }
  
        if (emp.pickUpAddress) {
          buttons.unshift({
            text: 'Адрес посадки',
            onPress: () => {
              const urlMap = Platform.select({
                ios: `maps:0,0?q=${emp.pickUpAddress}`,
                android: `geo:0,0?q=${emp.pickUpAddress}`,
              })
              
              Linking.openURL(urlMap);
            },
          });
        }
  
        Alert.alert(
          'Адрес сотрудника',
          `Адрес проживания: ${emp.address || 'Нет данных'}.\nАдрес посадки: ${emp.pickUpAddress || 'Нет данных'}.\nОткрыть в картах:\n`,
          buttons,
        );
      },
    },
  };
  

  const pageActions = {
    workTommorow: {
      // icon: <Work />,
      title: selected => `Поставить смену (${selected.length} сотрудников)`,
      action: (_, __, refetch, forceLoading, selected, setSelected) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            isWorking: true,
          },
          callback: (status, response) => {
            Alert.alert(
              'Смена нв завтра',
              status === 'ok' ? 'Информация о смене успешно обновлена' : `Ошибка при обновлении информации о смене: ${response.message}`,
              [{ text: 'OK' }],
            )
            refetch();

            if (status === 'ok') {
              setSelected([]);
            }
          },
        });
      },
    },
    dontWorkTommorow: {
      // icon: <WorkOff />,
      title: selected => `Убрать смену (${selected.length} сотрудников)`,
      action: (_, __, refetch, forceLoading, selected, setSelected) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            isWorking: false,
          },
          callback: (status, response) => {
            Alert.alert(
              'Смена нв завтра',
              status === 'ok' ? 'Информация о смене успешно обновлена' : `Ошибка при обновлении информации о смене: ${response.message}`,
              [{ text: 'OK' }],
            )
            refetch();

            if (status === 'ok') {
              setSelected([]);
            }
          },
        });
      },
    },
  }

  return (
    <View style={styles.main}>
      <View style={styles.blockBorderless}>
        <PaginatedTable
          url={url}
          columns={columns}
          actions={actions}
          customFilters={customFilters}
          resetCustomFilters={() => setCustomFilters(initFilters)}
          hiddenButRequiredData={hiddenButRequiredData}
          onAdd={onAdd}
          selectOn="id"
          addable={me.role === 'admin'}
          adding={adding}
          chips={chips}
          pageActions={pageActions}
          setAdding={isAdding => jumpTo('employees', { adding: isAdding })}
          addFieldsData={addFieldsData}
          filters={filters}
        />
      </View>
    </View>
  );
};

export default Employees;
