from app.pred_engine import AI_models
from app.pred_engine.Data_Converter.src import Converter_Main
import numpy as np

####################################################
# CONVERTER_MAIN.PY
####################################################


class TestConvertToInt:
    def test_cti_none_normal(self):
        d = ["0", "NORMAL"]
        result = Converter_Main.convert_to_int(d, -1, -1, -1)
        assert isinstance(result[0], int)
        assert result[1] == 1

    def test_cti_none_evolve(self):
        d = [False, "EVOLVE"]
        result = Converter_Main.convert_to_int(d, -1, -1, -1)
        assert isinstance(result[0], int)
        assert result[1] == 2

    def test_cti_lane_top(self):
        d = ["TOP"]
        result = Converter_Main.convert_to_int(d, 0, -1, -1)
        assert result[0] == 1

    def test_cti_lane_mid(self):
        d = ["MIDDLE"]
        result = Converter_Main.convert_to_int(d, 0, -1, -1)
        assert result[0] == 2

    def test_cti_lane_bot(self):
        d = ["BOTTOM"]
        result = Converter_Main.convert_to_int(d, 0, -1, -1)
        assert result[0] == 3

    def test_cti_lane_jung(self):
        d = ["JUNGLE"]
        result = Converter_Main.convert_to_int(d, 0, -1, -1)
        assert result[0] == 4

    def test_cti_lane_none(self):
        d = ["NONE"]
        result = Converter_Main.convert_to_int(d, 0, -1, -1)
        assert result[0] == 0

    def test_cti_role_none(self):
        d = ["NONE"]
        result = Converter_Main.convert_to_int(d, -1, 0, -1)
        assert result[0] == 0

    def test_cti_role_solo(self):
        d = ["SOLO"]
        result = Converter_Main.convert_to_int(d, -1, 0, -1)
        assert result[0] == 1

    def test_cti_role_carry(self):
        d = ["CARRY"]
        result = Converter_Main.convert_to_int(d, -1, 0, -1)
        assert result[0] == 2

    def test_cti_role_supp(self):
        d = ["SUPPORT"]
        result = Converter_Main.convert_to_int(d, -1, 0, -1)
        assert result[0] == 3

    def test_cti_role_duo(self):
        d = ["DUO"]
        result = Converter_Main.convert_to_int(d, -1, 0, -1)
        assert result[0] == 4

    def test_cti_pos_top(self):
        d = ["TOP"]
        result = Converter_Main.convert_to_int(d, -1, -1, 0)
        assert result[0] == 1

    def test_cti_pos_jung(self):
        d = ["JUNGLE"]
        result = Converter_Main.convert_to_int(d, -1, -1, 0)
        assert result[0] == 2

    def test_cti_pos_mid(self):
        d = ["MIDDLE"]
        result = Converter_Main.convert_to_int(d, -1, -1, 0)
        assert result[0] == 3

    def test_cti_pos_bot(self):
        d = ["BOTTOM"]
        result = Converter_Main.convert_to_int(d, -1, -1, 0)
        assert result[0] == 4

    def test_cti_pos_util(self):
        d = ["UTILITY"]
        result = Converter_Main.convert_to_int(d, -1, -1, 0)
        assert result[0] == 5


class TestRemoveDup:
    def test_r_is_zero(self):
        result = Converter_Main.remove_dup([], [], 0)
        assert result is False

    def test_not_dup(self):
        d1 = [0, 0]
        d2 = [1, 0]
        result = Converter_Main.remove_dup(d1, d2, 0)
        assert result is False

    def test_dup_rows(self):
        d1 = [1]
        d2 = [1]
        result = Converter_Main.remove_dup(d1, d2, 1)
        assert result is True


class TestFormatUnivar:

    def test_format_item_row(self):
        d = [[1, 2, 3, 4, 5]]
        result1, result2 = Converter_Main.format_data_univar(d, 4, 3, 2)
        assert result1[0][0] == 2
        assert result2[0][0] == 1

    def test_format_champ_row(self):
        d = [[1, 2, 3, 4, 5]]
        result1, result2 = Converter_Main.format_data_univar(d, 4, 3, 2)
        assert result1[0][0] == 2
        assert result2[0][0] == 1


class TestFormatMultivar:

    def test_data_list_row_list(self):
        d = [["TOP", 1, 2, 3]]
        result1, result2 = Converter_Main.format_data_multivar(d, -1, -1, 0)
        assert result2[0][0] == 1
        assert result2[0][1] == 1
        assert result1[0][0] == 2
        assert result1[0][1] == 3

    def test_format_skill_row(self):
        d = [[1, 2, 3, 4]]
        result1, result2 = Converter_Main.format_data_multivar(d, -1, -1, -1)
        assert result2[0][0] == 1
        assert result2[0][1] == 2
        assert result1[0][0] == 3
        assert result1[0][1] == 4


class TestTrainTestKnn:
    def test_get_tt_knn(self):
        f = "/backend/app/tests/pred_engine_test_files/unit_test_tt_data.csv"
        r1, _, r3, _ = Converter_Main.get_train_test_data_knn(f)

        assert len(r1[0]) == 3
        assert len(r3[0]) == 2


class TestTrainTestRF:
    def test_get_tt_champ(self):
        f = "/backend/app/tests/pred_engine_test_files/unit_test_tt_data.csv"
        r1, _, r3, _ = Converter_Main.get_train_test_data_rf(f, "champion")

        assert len(r1[0]) == 4
        assert len(r3[0]) == 1

    def test_get_tt_item(self):
        f = "/backend/app/tests/pred_engine_test_files/unit_test_tt_data.csv"
        r1, r2, r3, _ = Converter_Main.get_train_test_data_rf(f, "item")

        assert len(r1[0]) == 4
        assert len(r3[0]) == 1
        # check that duplicates got removed
        assert len(r1) + len(r2) == 10

    def test_get_tt_skill(self):
        f = "/backend/app/tests/pred_engine_test_files/unit_test_tt_data.csv"
        r1, r2, r3, _ = Converter_Main.get_train_test_data_rf(f, "skill")

        assert len(r1[0]) == 3
        assert len(r3[0]) == 2
        # check that duplicates got removed
        assert len(r1) + len(r2) == 11

    def test_get_tt_role(self):
        f = "/backend/app/tests/pred_engine_test_files/unit_test_tt_data.csv"
        r1, _, r3, _ = Converter_Main.get_train_test_data_rf(f, "role")

        assert len(r1[0]) == 3
        assert len(r3[0]) == 2


class TestConvertToRows:
    def test_1d_list(self):
        d = [1, 2]
        result = Converter_Main.convert_to_rows(d)
        assert result[0][0] == 1

    def test_2d_list(self):
        d = [[1, 2]]
        result = Converter_Main.convert_to_rows(d)
        assert result[0][0] == 1


class TestFormatApiKnn:
    def test_api_data_knn(self):
        d = [1, 2, 3, 4, 5]
        r1, r2 = Converter_Main.format_api_data_knn(d)
        assert len(r1) != 0
        assert len(r2) != 0
        assert len(r1[0]) != 0
        assert len(r2[0]) != 0


class TestFormatApiRf:
    def test_api_item_rf(self):
        d = [1, 2, 3, 4, 5]
        r1, r2 = Converter_Main.format_api_data_rf(d, "item")
        assert len(r1) != 0
        assert len(r2) != 0
        assert len(r1[0]) != 0
        assert len(r2[0]) != 0

    def test_api_skill_rf(self):
        d = [1, 2, 3, 4, 5]
        r1, r2 = Converter_Main.format_api_data_rf(d, "skill")
        assert len(r1) != 0
        assert len(r2) != 0
        assert len(r1[0]) != 0
        assert len(r2[0]) != 0

    def test_api_role_rf(self):
        d = [1, 2, 3, 4, 5]
        r1, r2 = Converter_Main.format_api_data_rf(d, "role")
        assert len(r1) != 0
        assert len(r2) != 0
        assert len(r1[0]) != 0
        assert len(r2[0]) != 0

    def test_api_champ_rf(self):
        d = [1, 2, 3, 4, 5]
        r1, r2 = Converter_Main.format_api_data_rf(d, "champion")
        assert len(r1) != 0
        assert len(r2) != 0
        assert len(r1[0]) != 0
        assert len(r2[0]) != 0


####################################################
# AI_MODELS.PY
####################################################


class TestAvgStd:
    def test_avg_std_none(self):
        d = []
        r1, r2 = AI_models.avg_and_std(d)
        assert r1 is None
        assert r2 is None

    def test_avg_std(self):
        d = [[1, 2], [1, 2]]
        r1, r2 = AI_models.avg_and_std(d)
        assert r1 is not None
        assert r2 is not None


class TestCorrectKnn:
    def test_avg_std_non_knn(self):
        d1 = []
        d2 = []
        result = AI_models.correct_knn(d1, d2)
        assert result is None

    def test_no_fix_knn(self):
        d1 = [[1, 2], [2, 1]]
        d2 = d1

        result = AI_models.correct_knn(d1, d2)
        assert result is not None
        assert np.array_equal(result, d1)

    def test_fix_knn(self):
        d1 = [[1, 2], [2, 1]]
        d2 = [[1, 2], [10, 20]]

        result = AI_models.correct_knn(d1, d2)
        assert result is not None
        assert not np.array_equal(result, d1)


class TestCorrectRoleRf:
    def test_same_data(self):
        d1 = [[1, 2]]
        d2 = [[1, 2]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is None

    def test_data_pos_top(self):
        d1 = [[1, 1]]
        d2 = [[2, 3]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is not None
        assert result[0] == "TOP"
        assert result[1] == "TOP"

    def test_data_pos_jung(self):
        d1 = [[2, 2]]
        d2 = [[3, 3]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is None

    def test_data_pos_mid(self):
        d1 = [[3, 3]]
        d2 = [[2, 3]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is None

    def test_data_pos_bot(self):
        d1 = [[4, 4]]
        d2 = [[2, 3]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is None

    def test_data_pos_util(self):
        d1 = [[5, 5]]
        d2 = [[2, 3]]
        x = [[266]]  # pos = TOP

        result = AI_models.correct_role_rf(d1, d2, x)
        assert result is None


class TestCorrectChampRf:
    def test_same_data(self):
        d1 = 1
        d2 = 1
        result = AI_models.correct_champion_rf(d1, d2)
        assert result is None

    def test_dif_data(self):
        d1 = 1
        d2 = 2
        result = AI_models.correct_champion_rf(d1, d2)
        assert result == d1
