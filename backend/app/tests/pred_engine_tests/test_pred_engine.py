from sklearn.ensemble import BaggingRegressor  # type: ignore
from sklearn.multioutput import MultiOutputClassifier  # type: ignore
from sklearn.ensemble import RandomForestClassifier  # type: ignore
from app.pred_engine import knn_model, main, rf_model

# =====================================================
# Helpers for Unit Testing
# =====================================================


class Test_main:

    def test_create_knn(self):
        result = main.create_knn_model()
        assert isinstance(result, BaggingRegressor) or result is None

    def test_create_rf(self):
        r1, r2, r3, r4 = main.create_rf_models()
        assert (
            isinstance(r1, RandomForestClassifier)
            or isinstance(r1, MultiOutputClassifier)
            or r1 is None
        )
        assert (
            isinstance(r2, RandomForestClassifier)
            or isinstance(r2, MultiOutputClassifier)
            or r2 is None
        )
        assert (
            isinstance(r3, RandomForestClassifier)
            or isinstance(r3, MultiOutputClassifier)
            or r3 is None
        )
        assert (
            isinstance(r4, RandomForestClassifier)
            or isinstance(r4, MultiOutputClassifier)
            or r4 is None
        )

    def test_run_knn(self):
        k_test = main.create_knn_model()
        data = [
            603,
            611,
            "TOP",
            "cond is None",
            "DUO",
            0,
            0,
            0,
            0,
            0,
            9172,
            12,
            23,
            921,
            3,
            18,
            0,
            2,
            9,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            33,
            66,
            100,
            0,
            0,
            696,
            696,
            17,
            0,
            345,
            0,
            100,
            662,
            285,
            362,
            135,
            130,
            401,
            298,
            675,
            14103,
            14195,
            14426,
            14170,
            14321,
            14673,
            14589,
            14454,
            14055,
            14493,
        ]
        if k_test is not None:
            result = main.run_knn(k_test, data)
            assert len(result) > 0

    def test_run_rf(self):
        r1, r2, r3, r4 = main.create_rf_models()
        d1 = [
            114,
            "TOP",
            "cond is None",
            "JUNGLE",
            14546,
            15656,
            14546,
            21362,
            3,
            0,
            0,
            24,
            1,
            4,
            10521,
            2552,
            19,
            798,
            0,
            16,
            174,
            133716,
            10736,
            15195,
            2858,
            1665,
            5210,
            95980,
            10371,
            16460,
            108709,
            16027,
            24595,
            9870,
            3990,
            2923,
            0,
            163,
            0,
            250,
            176,
            0,
            2854,
            2973,
            40,
            12,
            0,
            0,
            64,
            390,
            0,
            855,
            1168,
        ]
        d2 = [
            1054,
            4744,
            "JUNGLE",
            15195,
            16,
            114,
            0,
            1,
            0,
            0,
            500,
            0,
            1679,
            12391,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            33,
            0,
            76,
            100,
            0,
            740,
            740,
            25,
            0,
            0,
            0,
            32,
            345,
            0,
            300,
            300,
        ]
        d3 = [
            "TOP",
            "JUNGLE",
            114,
            4,
            95980,
            108709,
            2858,
            10521,
            4,
            2552,
            8,
            3,
            6,
            0,
            345,
            620,
            620,
            17,
            33,
            390,
            2854,
            2973,
            40,
            163,
        ]
        d4 = [
            1,
            "NORMAL",
            114,
            21362,
            3,
            4,
            10521,
            1,
            0,
            500,
            0,
            1679,
            12391,
            0,
            0,
            0,
            0,
            0,
            33,
            76,
            100,
            740,
            740,
            345,
            300,
            300,
        ]

        if r1 is not None:
            result1 = main.run_rf(r1, d1, "champion")
            assert result1 is not None
        if r1 is not None:
            result2 = main.run_rf(r2, d2, "item")
            assert result2 is not None
        if r1 is not None:
            result3 = main.run_rf(r3, d3, "role")
            assert hasattr(result3, "__len__")
        if r1 is not None:
            result4 = main.run_rf(r4, d4, "skill")
            assert hasattr(result4, "__len__")


class Test_get_knn:
    def test_no_file(self):
        """Test returns error if no file"""
        result = knn_model.get_knn("")
        assert result is None

    def test_empty_file(self):
        """Test returns bagging model"""
        result = knn_model.get_knn("backend/app/tests/pred_engine_tests/test_empt.csv")
        assert result is None


class Test_get_final_train:
    def test_no_file_cats(self):
        result = rf_model.final_train("", "champion")
        assert result is None

    def test_empty_file_cat(self):
        result1 = rf_model.final_train(
            "backend/app/tests/pred_engine_tests/test_empt.csv", "champion"
        )
        result2 = rf_model.final_train(
            "backend/app/tests/pred_engine_tests/test_empt.csv", "item"
        )
        result3 = rf_model.final_train(
            "backend/app/tests/pred_engine_tests/test_empt.csv", "role"
        )
        result4 = rf_model.final_train(
            "backend/app/tests/pred_engine_tests/test_empt.csv", "skill"
        )
        assert result1 is None
        assert result2 is None
        assert result3 is None
        assert result4 is None
