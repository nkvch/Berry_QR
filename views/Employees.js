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

const columns = {
  id: {
    name: 'ID',
    type: 'number',
    hidden: true,
  },
  contract: {
    name: 'Номер кантракта',
    type: 'text',
    hidden: true,
  },
  foremanId: {
    type: 'number',
    hidden: true,
  },
  firstName: {
    name: 'Имя',
    type: 'text',
  },
  lastName: {
    name: 'Фамилия',
    type: 'text',
  },
  address: {
    hidden: true,
  },
  pickUpAddress: {
    hidden: true,
  },
  workTomorrow: {
    hidden: true,
  },
  photoPath: {
    name: 'Фото',
    type: 'image',
    hidden: true,
  },
  phone: {
    name: 'Телефон',
    type: 'text',
    hidden: true,
  },
  foreman: {
    name: 'Бригадир',
    type: 'included',
    parse: foreman => foreman ? `${foreman.firstName} ${foreman.lastName}` : 'Нет данных',
    hidden: true,
  },
};

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

const chips = {
  workTomorrow: {
    show: emp => emp.workTomorrow,
    label: 'Работает завтра',
    style: {
      backgroundColor: 'rgba(255, 71, 71, 0.5)',
    }
  },
};

const Employees = ({ jumpTo, adding }) => {
  const me = useUser();
  const [selected, setSelected] = useState([]);

  const initFilters = me.role === 'foreman' ? { foremanId: me.id } : {};
  const [customFilters, setCustomFilters] = useState(initFilters);

  const onChangeFilters = values => {
    const { workTomorrow, foremanId } = values;
    setCustomFilters({
      ...(typeof foremanId === 'number' && { foremanId }),
      ...(workTomorrow !== 'null' && { workTomorrow }),
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
      workTomorrow: {
        label: 'Фильтровать по смене',
        type: 'select',
        selectConfig: {
          options: [
            { value: 'true', label: 'Работающие завтра' },
            { value: 'false', label: 'Не работающие завтра' },
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
      icon: 'cellphone-basic',
      action: emp => {
        Linking.openURL(`tel:+${emp.phone}`);
      },
    },
    goToAddress: {
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
    select: {
      customRender: ({ id }, _, refetch, forceLoading) => (
        <Checkbox
          status={selected.includes(id) ? 'checked' : 'unchecked'}
          key={`checkboxaction${id}`}
          onPress={() => selected.includes(id) ? setSelected(prev => prev.filter(el => el !== id)) : setSelected(prev => ([...prev, id]))}
        />
      ),
    }
  };
  

  const pageActions = {
    workTommorow: {
      // icon: <Work />,
      title: `Поставить смену (${selected.length} сотрудников)`,
      action: (_, __, refetch, forceLoading) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            workTomorrow: true,
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
      disabled: !selected.length,
    },
    dontWorkTommorow: {
      // icon: <WorkOff />,
      title: `Убрать смену (${selected.length} сотрудников)`,
      action: (_, __, refetch, forceLoading) => {
        forceLoading(true);

        request({
          url: `/employees/bulkUpdate`,
          method: 'PUT',
          body: {
            ids: selected,
            workTomorrow: false,
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
      disabled: !selected.length,
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
          onAdd={onAdd}
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
